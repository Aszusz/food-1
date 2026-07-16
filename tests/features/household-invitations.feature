Feature: Household invitations

  Scenario: A member creates a copyable invitation from Household Settings
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"
    When I open Household Settings
    Then I should see household member "alice@example.com"
    When I create a household invitation
    Then I should see a copyable invite link

  Scenario: A new account joins the invited household after signing up
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"
    When I open Household Settings
    And I create a household invitation
    And I open the household invitation while signed out
    And I sign up as "sam@example.com" to accept the invitation
    Then I should be viewing the "Recipes" workspace
    When I open Household Settings
    Then I should see household member "alice@example.com"
    And I should see household member "sam@example.com"

  Scenario: A member cannot join another household through an invitation
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"
    When I open Household Settings
    And I create a household invitation
    And I sign out
    And I sign up as "sam@example.com"
    And I create a household named "The Jones kitchen"
    And I open the household invitation
    Then I should see an invitation acceptance error

  Scenario: A member who leaves loses household access
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"
    When I open Household Settings
    And I leave the household
    Then I should be viewing Create Household
    When I visit the protected recipes page
    Then I should be viewing Create Household
