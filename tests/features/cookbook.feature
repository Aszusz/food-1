Feature: Household cookbook

  Scenario: Plan a recipe and collect an ingredient
    Given I am signed out
    When I sign up as "cook@example.com" named "Alex Cook"
    And I create a household named "The Cooks"
    And I create a recipe named "Tomato pasta" with cooking step "Boil until tender" and ingredients:
      | amount | name      |
      | 200 g  | spaghetti |
      | 1 tin  | tomatoes  |
    And I add the ingredients from "Tomato pasta" to the shopping list
    And I add the ingredients from "Tomato pasta" to the shopping list
    And I open the shopping list
    Then the shopping list should contain ingredients from "Tomato pasta":
      | amount | name      |
      | 200 g  | spaghetti |
      | 1 tin  | tomatoes  |
    When I check "spaghetti"
    Then "spaghetti" should be in the basket
