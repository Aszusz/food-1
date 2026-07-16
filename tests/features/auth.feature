Feature: Authentication

  Scenario: Sign in
    Given I have an account for "alice@example.com"
    When I sign in as "alice@example.com"
    Then I should be ready to create a household

  Scenario: Reject invalid credentials
    Given I have an account for "alice@example.com"
    When I sign in as "alice@example.com" with password "wrongpassword"
    Then I should see an invalid credentials message

  Scenario: Recover when the signup endpoint is unavailable
    Given the signup endpoint is unavailable
    When I sign up as "alice@example.com" named "Alice"
    Then I should see the signup error "Serwer nie odpowiada. Spróbuj ponownie."
    And the Create account button should be enabled

  Scenario: Anonymous users cannot access the cookbook
    Given I am signed out
    When I visit the protected cookbook
    Then I should be viewing the sign-in page
