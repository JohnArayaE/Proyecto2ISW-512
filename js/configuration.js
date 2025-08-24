// js/configuration.js
document.addEventListener("DOMContentLoaded", () => {
  const form       = document.querySelector(".config-form");
  const nameInput  = document.getElementById("name"); // Public Name -> firstname
  const bioInput   = document.getElementById("bio");
  const cancelLink = document.querySelector(".cancel-link");

  const safeParse = (s, fb) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };
  const emailLocal = (e) => (e || "").split("@")[0];

  // Usuario activo (debe existir)
  const active = safeParse(sessionStorage.getItem("usuarioActivo"), null);
  if (!active || !active.email) {
    // si no hay sesión, deshabilitamos el form para evitar errores
    [nameInput, bioInput].forEach(el => el.disabled = true);
    if (form) form.querySelector(".save-btn").disabled = true;
    console.warn("No active user in sessionStorage.usuarioActivo");
    return;
  }

  // Buscarlo en localStorage.users por email
  const users = safeParse(localStorage.getItem("users"), []);
  const idx = users.findIndex(
    u => String(u?.email || u?.ownerEmail || "").toLowerCase() === String(active.email).toLowerCase()
  );
  const user = idx >= 0 ? users[idx] : {};

  // Prefill:
  // - Public Name muestra firstname (o el de sesión; de último la parte local del email)
  // - Bio muestra lo guardado si existe
  const currentFirstname = user.firstname ?? active.firstname ?? emailLocal(active.email);
  nameInput.value = currentFirstname;
  bioInput.value  = (user.bio ?? active.bio ?? "");

  // Guardar (actualiza firstname; crea/actualiza bio)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newFirstname = nameInput.value.trim();
    const newBio       = bioInput.value.trim();

    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        // Actualiza firstname (no creamos publicName)
        firstname: newFirstname || users[idx].firstname,
        // Crea/actualiza bio
        bio: newBio
      };
      localStorage.setItem("users", JSON.stringify(users));
    } else {
      console.warn("Active user not found in localStorage.users; only session will be updated.");
    }

    // Reflejar también en la sesión
    const newActive = {
      ...active,
      firstname: newFirstname || active.firstname,
      bio: newBio
    };
    sessionStorage.setItem("usuarioActivo", JSON.stringify(newActive));

    
  });

  // Cancel: vuelve atrás
  cancelLink.addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });
});
