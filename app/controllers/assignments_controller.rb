# frozen_string_literal: true
require 'uri'
require "#{Rails.root}/lib/assignment_manager"
require "#{Rails.root}/lib/wiki_course_edits"

# Controller for Assignments
class AssignmentsController < ApplicationController
  respond_to :json
  before_action :set_course, except: [:update]

  def index
    @assignments = Assignment.where(user_id: params[:user_id],
                                    role: params[:role],
                                    course_id: @course.id)
    render json: @assignments
  end

  def destroy
    set_assignment { return }
    @course = @assignment.course
    check_permissions(@assignment.user_id)
    update_onwiki_course_and_assignments
    remove_assignment_template
    @assignment.destroy
    render json: { article: @id }
  end

  def create
    check_permissions(assignment_params[:user_id].to_i)
    set_wiki { return }
    set_new_assignment
    update_onwiki_course_and_assignments
    render json: @assignment
  end

  def update
    check_permissions(assignment_params[:user_id].to_i)
    @assignment = Assignment.find(assignment_params[:id])
    @assignment.update_attributes(assignment_params)
    if @assignment.save
      render json: { assignment: @assignment }, status: 200
    else
      render json: { errors: @assignment.errors, message: 'unable to update assignment' },
             status: 500
    end
  end

  private

  def update_onwiki_course_and_assignments
    WikiCourseEdits.new(action: :update_assignments, course: @course, current_user: current_user)
    WikiCourseEdits.new(action: :update_course, course: @course, current_user: current_user)
  end

  def remove_assignment_template
    WikiCourseEdits.new(action: :remove_assignment,
                        course: @course,
                        current_user: current_user,
                        assignment: @assignment)
  end

  def set_course
    @course = Course.find_by_slug(URI.unescape(params[:course_id]))
  end

  def set_assignment
    find_assignment_by_id
    return unless @assignment.nil?
    set_wiki { yield }
    find_assignment_by_params
    return unless @assignment.nil?
    render json: { message: t('error.invalid_assignment') }, status: 404
    yield
  end

  def find_assignment_by_id
    @id = params[:id]
    @assignment = Assignment.find_by(id: @id)
  end

  def find_assignment_by_params
    clean_title = params[:article_title].tr(' ', '_')
    @assignment ||= Assignment.find_by(user_id: params[:user_id],
                                       role: params[:role],
                                       wiki_id: @wiki.id,
                                       article_title: clean_title,
                                       course_id: @course.id)
  end

  def set_wiki
    find_or_create_wiki
    return unless @wiki.id.nil?
    # Error handling for an invalid wiki
    render json: { message: t('error.invalid_assignment') }, status: 404
    yield
  end

  def find_or_create_wiki
    home_wiki = @course.home_wiki
    language = params[:language].present? ? params[:language] : home_wiki.language
    project = params[:project].present? ? params[:project] : home_wiki.project
    @wiki = Wiki.find_or_create_by(language: language, project: project) || home_wiki
  end

  def set_new_assignment
    @assignment = AssignmentManager.new(user_id: assignment_params[:user_id],
                                        course: @course,
                                        wiki: @wiki,
                                        title: assignment_params[:title],
                                        role: assignment_params[:role]).create_assignment
  end

  def check_permissions(user_id)
    exception = ActionController::InvalidAuthenticityToken.new('Unauthorized')
    raise exception unless user_signed_in?
    return if current_user.id == user_id
    return if current_user.can_edit?(@course)
    raise exception
  end

  def assignment_params
    params.permit(:id, :user_id, :course_id, :title, :role, :language, :project)
  end
end
