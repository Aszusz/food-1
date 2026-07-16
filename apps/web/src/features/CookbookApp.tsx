import type { Recipe, ShoppingItem } from "@monobara/contract";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChefHat,
  ChevronRight,
  Clock3,
  Copy,
  Heart,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBasket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { authClient } from "../auth-client";
import type { Cookbook, RecipeInput } from "./useCookbook";
import { useCookbook } from "./useCookbook";

type View = "recipes" | "favorites" | "shopping" | "settings";

const recipeImages = [
  "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1200&q=85",
];

export function CookbookApp() {
  const cookbook = useCookbook();
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Recipe>();
  const [editing, setEditing] = useState<Recipe | null>();
  const [cooking, setCooking] = useState<Recipe>();

  if (cookbook.loading || !cookbook.overview) {
    return (
      <main className="loading-screen">
        <span className="brand-mark">
          <ChefHat />
        </span>
        <p>Otwieramy twój zeszyt kuchenny...</p>
      </main>
    );
  }

  if (!cookbook.overview.household) return <Onboarding cookbook={cookbook} />;

  const { household, recipes, shoppingItems } = cookbook.overview;
  const visibleRecipes = recipes.filter((recipe) => {
    const matchesSearch = `${recipe.title} ${recipe.description}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (view !== "favorites" || recipe.favorite);
  });

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onNavigate={navigate}
        householdName={household.name}
        shoppingCount={shoppingItems.filter((item) => !item.done).length}
        memberCount={household.members.length}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Otwórz menu"
          >
            <Menu />
          </button>
          <div className="mobile-brand">
            <span className="brand-mark small">
              <ChefHat />
            </span>{" "}
            Domowa książka kucharska
          </div>
          {view === "recipes" || view === "favorites" ? (
            <label className="search-box">
              <Search />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Szukaj w przepisach"
                aria-label="Szukaj przepisów"
              />
              <kbd>⌘ K</kbd>
            </label>
          ) : (
            <div />
          )}
          <div
            className="member-stack"
            title={memberCountLabel(household.members.length)}
          >
            {household.members.slice(0, 3).map((member) => (
              <span key={member.id} title={member.name}>
                {initials(member.name)}
              </span>
            ))}
          </div>
        </header>

        {view === "recipes" || view === "favorites" ? (
          <RecipesView
            recipes={visibleRecipes}
            allRecipes={recipes}
            householdName={household.name}
            favoritesOnly={view === "favorites"}
            onCreate={() => setEditing(null)}
            onOpen={setSelected}
            cookbook={cookbook}
          />
        ) : null}
        {view === "shopping" ? (
          <ShoppingView
            cookbook={cookbook}
            onBrowse={() => navigate("recipes")}
          />
        ) : null}
        {view === "settings" ? <SettingsView cookbook={cookbook} /> : null}
      </main>

      <nav className="mobile-nav" aria-label="Główna nawigacja">
        <NavButton
          icon={<BookOpen />}
          label="Przepisy"
          active={view === "recipes"}
          onClick={() => navigate("recipes")}
        />
        <NavButton
          icon={<Heart />}
          label="Ulubione"
          active={view === "favorites"}
          onClick={() => navigate("favorites")}
        />
        <NavButton
          icon={<ShoppingBasket />}
          label="Lista"
          active={view === "shopping"}
          onClick={() => navigate("shopping")}
        />
        <NavButton
          icon={<Settings />}
          label="Ustawienia"
          active={view === "settings"}
          onClick={() => navigate("settings")}
        />
      </nav>

      {editing !== undefined ? (
        <RecipeForm
          recipe={editing}
          onClose={() => setEditing(undefined)}
          onSave={async (recipe) => {
            await cookbook.saveRecipe(recipe);
            setEditing(undefined);
            setSelected(undefined);
          }}
        />
      ) : null}
      {selected ? (
        <RecipePanel
          key={selected.id}
          recipe={
            cookbook.overview.recipes.find(({ id }) => id === selected.id) ??
            selected
          }
          onClose={() => setSelected(undefined)}
          onEdit={(recipe) => setEditing(recipe)}
          onCook={(recipe) => setCooking(recipe)}
          cookbook={cookbook}
        />
      ) : null}
      {cooking ? (
        <CookingMode
          key={cooking.id}
          recipe={cooking}
          onClose={() => setCooking(undefined)}
        />
      ) : null}
    </div>
  );
}

function Sidebar({
  view,
  onNavigate,
  householdName,
  shoppingCount,
  memberCount,
  open,
  onClose,
}: {
  view: View;
  onNavigate: (view: View) => void;
  householdName: string;
  shoppingCount: number;
  memberCount: number;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="sidebar-scrim"
          onClick={onClose}
          aria-label="Zamknij menu"
        />
      ) : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button
          type="button"
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Zamknij menu"
        >
          <X />
        </button>
        <div className="brand">
          <span className="brand-mark">
            <ChefHat />
          </span>
          <div>
            <strong>Domowa</strong>
            <span className="brand-subtitle">książka kucharska</span>
          </div>
        </div>
        <nav className="side-nav" aria-label="Główna nawigacja">
          <NavButton
            icon={<BookOpen />}
            label="Wszystkie przepisy"
            active={view === "recipes"}
            onClick={() => onNavigate("recipes")}
          />
          <NavButton
            icon={<Heart />}
            label="Ulubione"
            active={view === "favorites"}
            onClick={() => onNavigate("favorites")}
          />
          <NavButton
            icon={<ShoppingBasket />}
            label="Lista zakupów"
            active={view === "shopping"}
            onClick={() => onNavigate("shopping")}
            badge={shoppingCount || undefined}
          />
        </nav>
        <div className="sidebar-bottom">
          <button
            type="button"
            className={`nav-button ${view === "settings" ? "active" : ""}`}
            onClick={() => onNavigate("settings")}
          >
            <Settings />
            <span>Ustawienia domowników</span>
          </button>
          <div className="household-card">
            <span className="avatar clay">{initials(householdName)}</span>
            <div>
              <strong>{householdName}</strong>
              <span>{memberCountLabel(memberCount)}</span>
            </div>
            <ChevronRight />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      className={`nav-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {badge ? <b>{badge}</b> : null}
    </button>
  );
}

function RecipesView({
  recipes,
  allRecipes,
  householdName,
  favoritesOnly,
  onCreate,
  onOpen,
  cookbook,
}: {
  recipes: Recipe[];
  allRecipes: Recipe[];
  householdName: string;
  favoritesOnly: boolean;
  onCreate: () => void;
  onOpen: (recipe: Recipe) => void;
  cookbook: Cookbook;
}) {
  const featured = recipes.find((recipe) => recipe.favorite) ?? recipes[0];
  return (
    <div className="page recipes-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{today()}</p>
          <h1>
            {favoritesOnly
              ? "Ulubione domowników"
              : `Witaj w grupie: ${householdName}`}
          </h1>
          <p>
            {favoritesOnly
              ? "Przepisy, do których wszyscy chętnie wracają."
              : "Co dziś wspólnie ugotujemy?"}
          </p>
        </div>
        <button type="button" className="primary-button" onClick={onCreate}>
          <Plus /> Nowy przepis
        </button>
      </div>

      {featured && !favoritesOnly ? (
        <section
          className="featured-card"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(31,28,22,.93) 0%, rgba(31,28,22,.6) 48%, rgba(31,28,22,.08) 100%), url(${imageFor(featured)})`,
          }}
        >
          <div>
            <span className="feature-label">
              <Heart /> Ulubiony przepis domowników
            </span>
            <h2>{featured.title}</h2>
            <p>
              {featured.description ||
                "Przepis, dla którego warto zebrać się przy wspólnym stole."}
            </p>
            <div className="recipe-meta light">
              <span>
                <Clock3 /> {featured.prepMinutes + featured.cookMinutes} min
              </span>
              <span>
                <Users /> {servingsLabel(featured.servings)}
              </span>
            </div>
            <button
              type="button"
              className="cream-button"
              onClick={() => onOpen(featured)}
            >
              Zobacz przepis <ChevronRight />
            </button>
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>{favoritesOnly ? "Zapisane ulubione" : "Twoje przepisy"}</h2>
            <p>{recipeCountLabel(recipes.length)}</p>
          </div>
        </div>
        {recipes.length ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onOpen={() => onOpen(recipe)}
                onFavorite={() => cookbook.toggleFavorite(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>
              <BookOpen />
            </span>
            <h2>
              {favoritesOnly && allRecipes.length
                ? "Brak ulubionych przepisów"
                : "Tutaj zaczyna się Twoja książka kucharska"}
            </h2>
            <p>
              {favoritesOnly && allRecipes.length
                ? "Dotknij serca przy przepisie, aby dodać go do ulubionych."
                : "Dodaj pierwszy przepis, który lubią gotować twoi domownicy."}
            </p>
            {!favoritesOnly || !allRecipes.length ? (
              <button
                type="button"
                className="primary-button"
                onClick={onCreate}
              >
                <Plus /> Dodaj przepis
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function RecipeCard({
  recipe,
  onOpen,
  onFavorite,
}: {
  recipe: Recipe;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  return (
    <article className="recipe-card">
      <button
        type="button"
        className="recipe-image"
        onClick={onOpen}
        style={{ backgroundImage: `url(${imageFor(recipe)})` }}
        aria-label={`Otwórz przepis ${recipe.title}`}
      />
      <button
        type="button"
        className={`favorite-button ${recipe.favorite ? "saved" : ""}`}
        onClick={onFavorite}
        aria-label={
          recipe.favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"
        }
      >
        <Heart />
      </button>
      <button type="button" className="recipe-card-body" onClick={onOpen}>
        <h3>{recipe.title}</h3>
        <p>
          {recipe.description ||
            ingredientCountLabel(recipe.ingredients.length)}
        </p>
        <div className="recipe-meta">
          <span>
            <Clock3 /> {recipe.prepMinutes + recipe.cookMinutes} min
          </span>
          <span>
            <Users /> {recipe.servings}
          </span>
        </div>
      </button>
    </article>
  );
}

function ShoppingView({
  cookbook,
  onBrowse,
}: {
  cookbook: Cookbook;
  onBrowse: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const items = cookbook.overview?.shoppingItems ?? [];
  const active = items.filter((item) => !item.done);
  const purchased = items.filter((item) => item.done);
  const progress = items.length
    ? Math.round((purchased.length / items.length) * 100)
    : 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await cookbook.addShoppingItem({
      name: name.trim(),
      amount: amount.trim(),
    });
    setName("");
    setAmount("");
  }

  return (
    <div className="page shopping-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Wspólna lista domowników</p>
          <h1>Lista zakupów</h1>
          <p>Zmiany będą widoczne dla wszystkich w ciągu kilku sekund.</p>
        </div>
        <div className="live-pill">
          <i /> Na żywo
        </div>
      </div>
      <section className="shopping-summary">
        <div>
          <span>
            Zebrano {purchased.length} z {items.length}
          </span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      </section>
      <form className="quick-add" onSubmit={submit}>
        <Plus />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Dodaj produkt..."
          aria-label="Nazwa produktu"
        />
        <input
          className="amount-input"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Ilość"
          aria-label="Ilość"
        />
        <button type="submit">Dodaj</button>
      </form>
      {items.length ? (
        <div className="shopping-groups">
          <ShoppingGroup
            title="Do kupienia"
            items={active}
            cookbook={cookbook}
          />
          {purchased.length ? (
            <ShoppingGroup
              title="W koszyku"
              items={purchased}
              cookbook={cookbook}
              purchased
            />
          ) : null}
          {purchased.length ? (
            <button
              type="button"
              className="text-button clear-button"
              onClick={() => cookbook.clearPurchased()}
            >
              <Trash2 /> Usuń kupione
            </button>
          ) : null}
        </div>
      ) : (
        <div className="empty-state compact">
          <span>
            <ShoppingBasket />
          </span>
          <h2>Lista jest gotowa</h2>
          <p>Dodaj produkt powyżej albo przenieś składniki z przepisu.</p>
          <button type="button" className="secondary-button" onClick={onBrowse}>
            Przeglądaj przepisy
          </button>
        </div>
      )}
    </div>
  );
}

function ShoppingGroup({
  title,
  items,
  cookbook,
  purchased = false,
}: {
  title: string;
  items: ShoppingItem[];
  cookbook: Cookbook;
  purchased?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section className="shopping-group">
      <div className="shopping-group-title">
        <h2>{title}</h2>
        <span>{items.length}</span>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={purchased ? "purchased" : ""}>
            <button
              type="button"
              className="check-button"
              onClick={() => cookbook.toggleShoppingItem(item.id)}
              aria-label={`${item.done ? "Odznacz" : "Zaznacz"} ${item.name}`}
            >
              {item.done ? <Check /> : null}
            </button>
            <div>
              <strong>{item.name}</strong>
              {item.source ? (
                <span>Z przepisu {item.source}</span>
              ) : (
                <span>Dodano ręcznie</span>
              )}
            </div>
            <em>{item.amount}</em>
            <button
              type="button"
              className="delete-button"
              onClick={() => cookbook.deleteShoppingItem(item.id)}
              aria-label={`Usuń ${item.name}`}
            >
              <X />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SettingsView({ cookbook }: { cookbook: Cookbook }) {
  const [copied, setCopied] = useState(false);
  const household = cookbook.overview?.household;
  if (!household) return null;
  const inviteCode = household.inviteCode;
  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="page settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Jedna wspólna kuchnia</p>
          <h1>Ustawienia domowników</h1>
          <p>Zaproś osoby, z którymi planujesz, robisz zakupy i gotujesz.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="settings-card invite-card">
          <span className="settings-icon">
            <Users />
          </span>
          <h2>Zaproś domownika</h2>
          <p>
            Zaproszona osoba może użyć tego kodu po utworzeniu własnego konta.
          </p>
          <button type="button" className="invite-code" onClick={copyCode}>
            <strong>{inviteCode}</strong>
            <span>
              {copied ? (
                <>
                  <Check /> Skopiowano
                </>
              ) : (
                <>
                  <Copy /> Kopiuj kod
                </>
              )}
            </span>
          </button>
        </section>
        <section className="settings-card">
          <div className="settings-card-heading">
            <div>
              <h2>{household.name}</h2>
              <p>{memberCountLabel(household.members.length)}</p>
            </div>
            <span className="avatar clay">{initials(household.name)}</span>
          </div>
          <ul className="member-list">
            {household.members.map((member) => (
              <li key={member.id}>
                <span className="avatar sage">{initials(member.name)}</span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="settings-card signout-card">
          <div>
            <h2>Twoje konto</h2>
            <p>Bezpiecznie wyloguj się na tym urządzeniu.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
          >
            <LogOut /> Wyloguj się
          </button>
        </section>
      </div>
    </div>
  );
}

function RecipePanel({
  recipe,
  onClose,
  onEdit,
  onCook,
  cookbook,
}: {
  recipe: Recipe;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onCook: (recipe: Recipe) => void;
  cookbook: Cookbook;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  async function addToList() {
    await cookbook.addRecipeToList(recipe.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }
  return (
    <div className="modal-layer">
      <button
        type="button"
        className="modal-scrim"
        onClick={onClose}
        aria-label="Zamknij przepis"
      />
      <section className="recipe-panel" aria-label={recipe.title}>
        <div
          className="panel-image"
          style={{
            backgroundImage: `linear-gradient(180deg, transparent, rgba(20,18,15,.5)), url(${imageFor(recipe)})`,
          }}
        >
          <button
            type="button"
            className="round-button back"
            onClick={onClose}
            aria-label="Zamknij"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className={`round-button panel-heart ${recipe.favorite ? "saved" : ""}`}
            onClick={() => cookbook.toggleFavorite(recipe.id)}
            aria-label={
              recipe.favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"
            }
          >
            <Heart />
          </button>
        </div>
        <div className="panel-content">
          <div className="panel-title">
            <div>
              <h1>{recipe.title}</h1>
              <p>{recipe.description}</p>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => onEdit(recipe)}
              aria-label="Edytuj przepis"
            >
              <Pencil />
            </button>
          </div>
          <div className="stat-row">
            <span>
              <Clock3 />
              <strong>{recipe.prepMinutes + recipe.cookMinutes} min</strong>
              <small>Łączny czas</small>
            </span>
            <span>
              <Users />
              <strong>{recipe.servings}</strong>
              <small>Porcje</small>
            </span>
            <span>
              <BookOpen />
              <strong>{recipe.steps.length}</strong>
              <small>Kroki</small>
            </span>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onCook(recipe)}
            >
              <ChefHat /> Zacznij gotować
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={addToList}
            >
              {added ? (
                <>
                  <Check /> Dodano do listy
                </>
              ) : (
                <>
                  <ShoppingBasket /> Dodaj do listy
                </>
              )}
            </button>
          </div>
          <section className="ingredient-section">
            <div className="section-heading">
              <div>
                <h2>Składniki</h2>
                <p>Odhaczaj podczas przygotowywania</p>
              </div>
            </div>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ingredient, index) => {
                const key = `${index}-${ingredient.name}`;
                const done = checked.includes(key);
                return (
                  <li key={key} className={done ? "checked" : ""}>
                    <button
                      type="button"
                      className="check-button"
                      onClick={() =>
                        setChecked(
                          done
                            ? checked.filter((item) => item !== key)
                            : [...checked, key],
                        )
                      }
                    >
                      {done ? <Check /> : null}
                    </button>
                    <strong>{ingredient.name}</strong>
                    <span>{ingredient.amount}</span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="method-section">
            <h2>Przygotowanie</h2>
            <ol>
              {recipe.steps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
          <button
            type="button"
            className="danger-link"
            onClick={async () => {
              if (window.confirm(`Usunąć przepis „${recipe.title}”?`)) {
                await cookbook.deleteRecipe(recipe.id);
                onClose();
              }
            }}
          >
            <Trash2 /> Usuń przepis
          </button>
        </div>
      </section>
    </div>
  );
}

function RecipeForm({
  recipe,
  onClose,
  onSave,
}: {
  recipe: Recipe | null;
  onClose: () => void;
  onSave: (recipe: RecipeInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [prepMinutes, setPrepMinutes] = useState(recipe?.prepMinutes ?? 15);
  const [cookMinutes, setCookMinutes] = useState(recipe?.cookMinutes ?? 30);
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients
      .map(({ amount, name }) => `${amount} | ${name}`)
      .join("\n") ?? "",
  );
  const [steps, setSteps] = useState(recipe?.steps.join("\n") ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsedIngredients = ingredients
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [amount, ...name] = line.split("|");
        return name.length
          ? { amount: amount.trim(), name: name.join("|").trim() }
          : { amount: "", name: amount.trim() };
      });
    const parsedSteps = steps
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);
    if (!title.trim() || !parsedIngredients.length || !parsedSteps.length) {
      setError(
        "Dodaj nazwę, co najmniej jeden składnik i jeden krok przygotowania.",
      );
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: recipe?.id,
        title: title.trim(),
        description: description.trim(),
        prepMinutes,
        cookMinutes,
        servings,
        ingredients: parsedIngredients,
        steps: parsedSteps,
      });
    } catch {
      setError("Nie udało się zapisać przepisu. Spróbuj ponownie.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-layer form-layer">
      <button
        type="button"
        className="modal-scrim"
        onClick={onClose}
        aria-label="Zamknij formularz"
      />
      <section className="recipe-form-panel">
        <header>
          <div>
            <p className="eyebrow">Zeszyt kuchenny</p>
            <h1>{recipe ? "Edytuj przepis" : "Nowy przepis"}</h1>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Zamknij"
          >
            <X />
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Nazwa przepisu
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="np. niedzielny makaron z pomidorami"
            />
          </label>
          <label>
            Krótki opis
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Co wyróżnia ten przepis?"
              rows={2}
            />
          </label>
          <div className="form-row">
            <label>
              Przygotowanie (min)
              <input
                type="number"
                min="0"
                value={prepMinutes}
                onChange={(event) => setPrepMinutes(Number(event.target.value))}
              />
            </label>
            <label>
              Gotowanie (min)
              <input
                type="number"
                min="0"
                value={cookMinutes}
                onChange={(event) => setCookMinutes(Number(event.target.value))}
              />
            </label>
            <label>
              Liczba porcji
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(event) => setServings(Number(event.target.value))}
              />
            </label>
          </div>
          <label>
            Składniki <small>Jeden na wiersz: ilość | składnik</small>
            <textarea
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
              placeholder={
                "2 szklanki | pomidorki koktajlowe\n1 garść | świeża bazylia"
              }
              rows={6}
            />
          </label>
          <label>
            Kroki przygotowania <small>Jeden krok na wiersz</small>
            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder={
                "Zagotuj osoloną wodę w dużym garnku.\nUgotuj makaron al dente."
              }
              rows={7}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Zapisywanie..." : "Zapisz przepis"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CookingMode({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = recipe.steps[step];
  return (
    <div className="cooking-mode">
      <header>
        <button type="button" className="round-button" onClick={onClose}>
          <X />
        </button>
        <div>
          <span>Gotowanie</span>
          <strong>{recipe.title}</strong>
        </div>
        <em>
          {step + 1} / {recipe.steps.length}
        </em>
      </header>
      <main>
        <div className="cooking-progress">
          {recipe.steps.map((item, index) => (
            <i key={item} className={index <= step ? "active" : ""} />
          ))}
        </div>
        <p className="eyebrow">Krok {step + 1}</p>
        <h1>{current}</h1>
        <div className="cooking-nav">
          <button
            type="button"
            className="secondary-button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Wstecz
          </button>
          {step === recipe.steps.length - 1 ? (
            <button type="button" className="primary-button" onClick={onClose}>
              <Check /> Zakończ gotowanie
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={() => setStep(step + 1)}
            >
              Następny krok <ChevronRight />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Onboarding({ cookbook }: { cookbook: Cookbook }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (mode === "create") await cookbook.createHousehold(value.trim());
      else await cookbook.joinHousehold(value.trim());
    } catch {
      setError(
        mode === "join"
          ? "Nie znaleziono takiego kodu zaproszenia."
          : "Nie udało się utworzyć grupy domowników.",
      );
      setSaving(false);
    }
  }
  return (
    <main className="onboarding">
      <section className="onboarding-story">
        <div className="brand light-brand">
          <span className="brand-mark">
            <ChefHat />
          </span>
          <div>
            <strong>Domowa</strong>
            <span className="brand-subtitle">książka kucharska</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">Wasz wspólny zeszyt kuchenny</p>
          <h1>
            Planuj. Kupuj.
            <br />
            Gotujcie razem.
          </h1>
          <p>
            Przechowuj ulubione przepisy i wspólną listę zakupów w jednym,
            wygodnym miejscu.
          </p>
        </div>
        <blockquote>
          „Wspólne posiłki są prostsze, gdy każdy wie, co dziś gotujemy”.
        </blockquote>
      </section>
      <section className="onboarding-form">
        <div className="onboarding-card">
          <p className="eyebrow">Jeszcze tylko jeden krok</p>
          <h2>
            {mode === "create"
              ? "Nazwij swoją grupę"
              : "Dołącz do swojej grupy"}
          </h2>
          <p>
            {mode === "create"
              ? "To prywatna przestrzeń dla osób, z którymi wspólnie gotujesz."
              : "Wpisz kod zaproszenia otrzymany od jednego z domowników."}
          </p>
          <div className="mode-switch">
            <button
              type="button"
              className={mode === "create" ? "active" : ""}
              onClick={() => {
                setMode("create");
                setValue("");
                setError("");
              }}
            >
              Nowa grupa
            </button>
            <button
              type="button"
              className={mode === "join" ? "active" : ""}
              onClick={() => {
                setMode("join");
                setValue("");
                setError("");
              }}
            >
              Użyj kodu zaproszenia
            </button>
          </div>
          <form onSubmit={submit}>
            <label>
              {mode === "create" ? "Nazwa grupy" : "Kod zaproszenia"}
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={
                  mode === "create" ? "np. Rodzina Kowalskich" : "np. A1B2C3D4"
                }
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button
              type="submit"
              className="primary-button wide"
              disabled={saving}
            >
              {saving
                ? "Konfigurowanie..."
                : mode === "create"
                  ? "Utwórz grupę"
                  : "Dołącz do grupy"}
              <ChevronRight />
            </button>
          </form>
          <button
            type="button"
            className="text-button signout-link"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
          >
            Wyloguj się
          </button>
        </div>
      </section>
    </main>
  );
}

function imageFor(recipe: Recipe) {
  const hash = [...recipe.title].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  return recipeImages[hash % recipeImages.length];
}

function initials(value: string) {
  return value
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function today() {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function recipeCountLabel(count: number) {
  return countLabel(count, "przepis", "przepisy", "przepisów");
}

function ingredientCountLabel(count: number) {
  return countLabel(count, "składnik", "składniki", "składników");
}

function memberCountLabel(count: number) {
  return countLabel(count, "domownik", "domowników", "domowników");
}

function servingsLabel(count: number) {
  return countLabel(count, "porcja", "porcje", "porcji");
}

function countLabel(count: number, one: string, few: string, many: string) {
  const form = new Intl.PluralRules("pl-PL").select(count);
  return `${count} ${form === "one" ? one : form === "few" ? few : many}`;
}
