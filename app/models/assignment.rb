# == Schema Information
#
# Table name: assignments
#
#  id            :integer          not null, primary key
#  created_at    :datetime
#  updated_at    :datetime
#  user_id       :integer
#  course_id     :integer
#  article_id    :integer
#  article_title :string(255)
#  role          :integer
#  wiki_id       :integer
#

#= Assignment model
class Assignment < ActiveRecord::Base
  belongs_to :user
  belongs_to :course
  belongs_to :article
  belongs_to :wiki

  scope :assigned, -> { where(role: 0) }
  scope :reviewing, -> { where(role: 1) }

  before_validation :set_defaults_and_normalize

  #############
  # CONSTANTS #
  #############
  module Roles
    ASSIGNED_ROLE  = 0
    REVIEWING_ROLE = 1
  end

  ####################
  # Instance methods #
  ####################
  def page_url
    "#{wiki.base_url}wiki/#{article_title}"
  end

  # A sibling assignment is an assignment for a different user,
  # but for the same Article in the same course.
  def sibling_assignments
    Assignment
      .where(course_id: course_id, article_id: article_id)
      .where.not(id: id)
      .where.not(user: user_id)
  end

  def set_defaults_and_normalize
    self.article_title &&= article_title.tr(' ', '_')
    # FIXME: transitional only
    self.wiki_id ||= Wiki.default_wiki.id
  end
end
