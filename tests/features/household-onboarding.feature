Feature: Household onboarding

  Scenario: A new account creates its first household
    Given I am signed out
    When I sign up as "alice@example.com"
    Then I should be viewing Create Household
    When I create a household named "The Smith kitchen"
    Then I should be viewing the empty Recipes workspace

  Scenario: A household member stays in the workspace after refresh
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"
    When I refresh the page
    Then I should be viewing the empty Recipes workspace

  Scenario: An account without a household is sent to onboarding
    Given I am signed in as "alice@example.com"
    When I visit the protected recipes page
    Then I should be viewing Create Household

  Scenario: Anonymous users are sent to login from the workspace
    Given I am signed out
    When I visit the protected recipes page
    Then I should be viewing the login page
