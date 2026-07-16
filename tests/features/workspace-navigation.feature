Feature: Household workspace navigation

  Background:
    Given I am signed in as "alice@example.com"

  Scenario: A household member can navigate the workspace
    When I create a household named "The Smith kitchen"
    Then I should be viewing the "Recipes" workspace
    And I should see workspace navigation for "The Smith kitchen"
    And the "Recipes" navigation control should be selected
    And I should see the New Recipe action
    When I select "Shopping" from workspace navigation
    Then I should be viewing the "Shopping" workspace
    And I should see workspace navigation for "The Smith kitchen"
    And the "Shopping" navigation control should be selected
    When I select "Settings" from workspace navigation
    Then I should be viewing the "Settings" workspace
    And I should see workspace navigation for "The Smith kitchen"
    And the "Settings" navigation control should be selected
    And I should see the Settings entry links
    When I select "Recipes" from workspace navigation
    Then I should be viewing the "Recipes" workspace
    And the "Recipes" navigation control should be selected

  Scenario: Recipes is selected by default after an existing member logs in
    And I create a household named "The Smith kitchen"
    When I sign out
    And I log in as "alice@example.com"
    Then I should be viewing the "Recipes" workspace
    And the "Recipes" navigation control should be selected

  Scenario: An empty Shopping workspace exposes Add Item
    And I create a household named "The Smith kitchen"
    When I select "Shopping" from workspace navigation
    Then I should be viewing the "Shopping" workspace
    And the "Shopping" navigation control should be selected
    And I should see the Add Item action

  Scenario: An account without a household cannot access workspace navigation
    When I visit the protected recipes page
    Then I should be viewing Create Household
    And workspace navigation should not be available
