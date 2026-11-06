ENV["RAILS_ENV"] ||= "test"

require "simplecov"
# docs/test-plan.md: 95% line coverage on the backend.
SimpleCov.start "rails" do
  minimum_coverage line: 95
end

require_relative "../config/environment"
require "rails/test_help"
require_relative "test_helpers/session_test_helper"
require_relative "test_helpers/api_test_helper"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Merge coverage from the forked parallel workers.
    parallelize_setup do |worker|
      SimpleCov.command_name "#{SimpleCov.command_name}-#{worker}"
    end

    parallelize_teardown do |_worker|
      SimpleCov.result
    end

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Login rate limiting counts in the in-memory cache; keep tests independent.
    setup { Rails.cache.clear }

    # Add more helper methods to be used by all tests here...
  end
end
