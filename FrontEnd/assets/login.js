document.addEventListener("DOMContentLoaded", () => {
  // -------- Helpers
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const setText = (el, txt = "") => el && (el.textContent = txt);
  const show = (el, display = "block") => el && (el.style.display = display);
  const hide = (el) => el && (el.style.display = "none");
  const getToken = () => localStorage.getItem("token");
  const setToken = (t) => localStorage.setItem("token", t);
  const clearToken = () => localStorage.removeItem("token");

  // -------- UI: édition / filtres / navbar
  function updateAuthUI(tokenPresent) {
    const editBar = qs(".edit-mode");
    const modifiers = qsa(".modifier");
    const filters = qs("#filtres");
    const logoutLi = qs("#logout");

    if (tokenPresent) {
      show(editBar, "flex");
      modifiers.forEach((m) => show(m, "flex"));
      hide(filters);
      if (logoutLi) logoutLi.innerHTML = '<a href="#" id="logoutLink">logout</a>';
    } else {
      hide(editBar);
      modifiers.forEach(hide);
      show(filters, "flex");
      if (logoutLi) logoutLi.innerHTML = '<a href="login.html">login</a>';
    }
  }

  // -------- Connexion (si le formulaire est présent)
  const form = qs("form#login-form, #login form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = qs("#email").value.trim();
      const password = qs("#password").value;
      const errorDiv = qs(".error-message") || qs("#login_error");
      setText(errorDiv, "");

      if (!email || !password) return setText(errorDiv, "Veuillez remplir tous les champs.");

      try {
        const res = await fetch("http://localhost:5678/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          if (res.status === 401) return setText(errorDiv, "Mot de passe incorrect.");
          if (res.status === 404) return setText(errorDiv, "Adresse e-mail inconnue.");
          return setText(errorDiv, "Erreur lors de la connexion. Veuillez réessayer.");
        }

        const data = await res.json();
        if (data?.token) setToken(data.token);
        // Mise à jour UI sans rechargement
        updateAuthUI(true);
        setText(errorDiv, "Connexion réussie.");
        // Optionnel: masquer le formulaire après succès
        hide(form);
      } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        setText(errorDiv, "Une erreur réseau est survenue.");
      }
    });
  }

  // -------- Déconnexion (délégation globale)
  document.addEventListener("click", (e) => {
    if (e.target?.id === "logoutLink") {
      e.preventDefault();
      clearToken();
      updateAuthUI(false);
      const filters = qs("#filtres");
      show(filters, "flex");
      // Si un formulaire de login existe sur la page, le réafficher
      const loginForm = qs("form#login-form, #login form");
      if (loginForm) show(loginForm, "flex");
      const errorDiv = qs(".error-message") || qs("#login_error");
      setText(errorDiv, "Vous êtes déconnecté.");
    }
  });

  // -------- Init UI
  updateAuthUI(Boolean(getToken()));
});


