Feature: Auth

  Scenario: Sign up
    Given I am signed out
    When I sign up as "alice@example.com"
    Then I should be viewing the todo app

  Scenario: Log in
    Given I have an account for "alice@example.com"
    When I log in as "alice@example.com"
    Then I should be viewing the todo app

  Scenario: Invalid credentials
    Given I have an account for "alice@example.com"
    When I log in as "alice@example.com" with password "wrongpassword"
    Then I should see an invalid credentials message

  Scenario: Authenticated users skip login
    Given I am signed in as "alice@example.com"
    When I visit the login page
    Then I should be viewing the todo app

  Scenario: Authenticated users skip signup
    Given I am signed in as "alice@example.com"
    When I visit the signup page
    Then I should be viewing the todo app

  Scenario: Anonymous users cannot access protected routes
    Given I am signed out
    When I visit the protected todos page
    Then I should be viewing the login page
