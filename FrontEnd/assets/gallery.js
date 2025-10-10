document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const filtres = document.querySelector("#filtres");
  if (!gallery) return;

  let allProjects = [];

  const render = (list) => {
    gallery.innerHTML = list
      .map(
        (p) =>
          `<figure><img src="${p.imageUrl}" alt="${p.title || "Projet"}" data-id="${p.id}"><figcaption>${p.title || "Projet"}</figcaption></figure>`
      )
      .join("");
  };

  const normalize = (name) => (name || "").toLowerCase();

  async function loadProjects() {
    try {
      const res = await fetch("http://localhost:5678/api/works");
      const data = await res.json();
      allProjects = data.map((p) => ({
        ...p,
        __cat: normalize(p?.category?.name),
      }));
      render(allProjects);
    } catch (e) {
      console.error("Erreur lors du chargement des projets :", e);
    }
  }

  if (filtres) {
    filtres.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const f = btn.dataset.filter;
      render(f === "all" ? allProjects : allProjects.filter((p) => p.__cat === normalize(f)));
    });
  }

  window.ajouterProjetDansGalerie = (projet) => {
    if (!projet) return;
    const proj = { ...projet, __cat: normalize(projet?.category?.name) };
    allProjects = [...allProjects, proj];
    render(allProjects);
  };

  window.supprimerProjetDansGalerie = (id) => {
    allProjects = allProjects.filter((p) => String(p.id) !== String(id));
    render(allProjects);
  };

  loadProjects();
});

