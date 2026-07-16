Feature: Recipe create, view, and edit

  Background:
    Given I am signed in as "alice@example.com"
    And I create a household named "The Smith kitchen"

  Scenario: A member opens the recipe editor from the Recipe List
    When I select the New Recipe action
    Then I should be viewing the New Recipe editor
    And no Hooks error should have occurred during navigation

  Scenario: A new recipe editor shows empty ingredient and step lists
    When I select the New Recipe action
    Then the recipe editor should show empty ingredient and step lists
    And the recipe editor fields should have visible labels
    And the "Recipes" navigation control should be selected

  Scenario: A member keeps unsaved changes after dismissing navigation confirmation
    When I select the New Recipe action
    And I enter recipe title "Unsaved vegetable soup"
    And I dismiss the confirmation to return to the Recipe List
    Then I should be viewing the New Recipe editor
    And the recipe editor title should be "Unsaved vegetable soup"

  Scenario: A member removes the last cooking step from the new recipe editor
    When I select the New Recipe action
    And I add cooking step "Chop the vegetables"
    And I remove cooking step "Chop the vegetables"
    Then the recipe editor should show an empty cooking step list

  Scenario: A member moves an ingredient down in the new recipe editor
    When I select the New Recipe action
    And I add ingredient "Carrot" with quantity "2" and unit "whole"
    And I add ingredient "Salt" with quantity "1" and unit "tsp"
    And I move ingredient "Carrot" down
    Then ingredient names in the recipe editor should appear in this order:
      | name   |
      | Salt   |
      | Carrot |

  Scenario: A member edits an ingredient in the new recipe editor
    When I select the New Recipe action
    And I add ingredient "Carrot" with quantity "2" and unit "whole"
    And I rename ingredient "Carrot" to "Parsnip"
    Then ingredient names in the recipe editor should appear in this order:
      | name    |
      | Parsnip |

  Scenario: A member moves a cooking step down in the new recipe editor
    When I select the New Recipe action
    And I add cooking step "Chop the vegetables"
    And I add cooking step "Simmer for 20 minutes"
    And I move cooking step "Chop the vegetables" down
    Then cooking steps in the recipe editor should appear in this order:
      | step                  |
      | Simmer for 20 minutes |
      | Chop the vegetables   |

  Scenario: A member creates an ordered recipe
    When I select the New Recipe action
    And I enter recipe title "Vegetable soup"
    And I enter recipe description "A warming soup"
    And I add ingredient "Carrot" with quantity "2" and unit "whole"
    And I add ingredient "Celery" with quantity "1" and unit "stalk"
    And I add ingredient "Salt" with quantity "1" and unit "tsp" and note "to taste"
    And I remove ingredient "Celery"
    And I move ingredient "Salt" up
    And I add cooking step "Chop the vegetables"
    And I add cooking step "Simmer for 20 minutes"
    And I move cooking step "Simmer for 20 minutes" up
    And I save the recipe
    Then I should be viewing Recipe Detail for "Vegetable soup"
    And Recipe Detail should show recipe "Vegetable soup" with description "A warming soup"
    And Recipe Detail should show ingredients in this order:
      | quantity | unit  | name   | note     |
      | 1        | tsp   | Salt   | to taste |
      | 2        | whole | Carrot |          |
    And Recipe Detail should show cooking steps in this order:
      | step                   |
      | Simmer for 20 minutes  |
      | Chop the vegetables    |
    When I return to the Recipe List
    Then I should see recipe "Vegetable soup" in the Recipe List
    When I refresh the page
    Then I should see recipe "Vegetable soup" in the Recipe List

  Scenario: A member edits a recipe and changes persist
    Given I have created recipe "Vegetable soup"
    When I open recipe "Vegetable soup" from the Recipe List
    And I select Edit Recipe
    Then the recipe editor should be prefilled with recipe "Vegetable soup"
    When I change the recipe title to "Hearty vegetable soup"
    And I save the recipe
    Then I should be viewing Recipe Detail for "Hearty vegetable soup"
    When I refresh the page
    Then Recipe Detail should show recipe "Hearty vegetable soup"

  Scenario: A member of another household cannot read or modify a recipe
    Given I have created recipe "Vegetable soup"
    And I record the address for recipe "Vegetable soup"
    When I sign out
    And I sign up as "sam@example.com"
    And I create a household named "The Jones kitchen"
    And I visit the recorded recipe address
    Then I should be returned to the Recipe List
    And I should not see recipe "Vegetable soup" in the Recipe List
