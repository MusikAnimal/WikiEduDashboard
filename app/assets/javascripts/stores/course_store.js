import _ from 'lodash';
import McFly from 'mcfly';
let Flux        = new McFly();
import API from '../utils/api.coffee';
import ServerActions from '../actions/server_actions.js';


// Data
let _course = {};
let _persisted = {};
let _loaded = false;


// Utilities
let setCourse = function(data, persisted=false, quiet=false) {
  console.log('setCourse', data);
  _loaded = true;
  $.extend(true, _course, data);
  delete _course['weeks'];
  if (persisted) { _persisted = $.extend(true, {}, _course); }
  if (!quiet) { return CourseStore.emitChange(); }
};

let setError = function(error) {
  _course.error = error;
  return CourseStore.emitChange();
};

let clearError = () => _course.error = undefined;

let updateCourseValue = function(key, value) {
  _course[key] = value;
  return CourseStore.emitChange();
};

let addCourse = () =>
  setCourse({
    title: "",
    description: "",
    school: "",
    term: "",
    subject: "",
    expected_students: 0,
    start: null,
    end: null,
    day_exceptions: "",
    weekdays: "0000000",
    editingSyllabus: false
  })
;

let _dismissNotification = function(payload) {
  let notifications = _course.survey_notifications;
  let { id } = payload.data;
  let index = _.indexOf(notifications, _.where(notifications, { id })[0]);
  delete _course.survey_notifications[index];
  return CourseStore.emitChange();
};

let _handleSyllabusUploadResponse = function(data) {
  if (data.url.indexOf('missing.png') > -1) { return undefined; }
  return data.url;
};

// Store
var CourseStore = Flux.createStore({
  getCourse() {
    return _course;
  },
  getCurrentWeek() {
    return Math.max(moment().startOf('week').diff(moment(_course.timeline_start).startOf('week'), 'weeks'), 0);
  },
  restore() {
    _course = $.extend(true, {}, _persisted);
    return CourseStore.emitChange();
  },
  isLoaded() {
    return _loaded;
  }
}
, function(payload) {
  let { data } = payload;
  clearError();
  switch(payload.actionType) {
    case 'DISMISS_SURVEY_NOTIFICATION':
      _dismissNotification(payload);
      break;
    case 'RECEIVE_COURSE': case 'CREATED_COURSE': case 'COHORT_MODIFIED': case 'SAVED_COURSE': case 'CHECK_COURSE': case 'PERSISTED_COURSE':
      setCourse(data.course, true);
      break;
    case 'UPDATE_CLONE': case 'RECEIVE_COURSE_CLONE':
      setCourse(data.course, true);
      break;
    case 'UPDATE_COURSE':
      setCourse(data.course);
      if (data.save) {
        ServerActions.saveCourse($.extend(true, {}, { course: _course }), data.course.slug);
      }
      break;
    case 'SYLLABUS_UPLOAD_SUCCESS':
      let url = _handleSyllabusUploadResponse(data);
      setCourse({
        uploadingSyllabus: false,
        editingSyllabus: false
      });
      updateCourseValue('syllabus', url);
      break;
    case 'UPLOADING_SYLLABUS':
      setCourse(
        {uploadingSyllabus: true});
      break;
    case 'TOGGLE_EDITING_SYLLABUS':
      setCourse(
        {editingSyllabus: data.bool});
      break;
    case 'ADD_COURSE':
      addCourse();
      break;
  }
  return true;
});

export default CourseStore;
