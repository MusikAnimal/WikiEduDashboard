class FixCoursesUsersColumnNames < ActiveRecord::Migration
  def change
    rename_column :courses_users, :characters_sum_ms, :character_sum_ms
    rename_column :courses_users, :characters_sum_us, :character_sum_us
  end
end
