export const getMenuStyles = (menuOpened) => {
  if (document.documentElement.clientWidth <= 800) {
    return { right: !menuOpened && "-100%" };
  }
};

export const sliderSettings = {
  slidesPerView: 1,
  spaceBetween: 50,
  breakpoints: {
    480: {
      slidesPerView: 1,
    },
    600: {
      slidesPerView: 2,
    },
    750: {
      slidesPerView: 3,
    },
    1100: {
      slidesPerView: 4,
    },
  },
};

export const updateFavourites = (id, favourites) => {
  if (favourites.includes(id)) {
    return favourites.filter((resId) => resId !== id);
  } else {
    return [...favourites, id];
  }
};

export const checkFavourites = (id, favourites) => {
  return favourites?.includes(id) ? "#fa3e5f" : "white";
};

export const validateString = (value) => {
  return value?.length < 3 || value === null
    ? "Must have atleast 3 characters"
    : null;
};

// Gracefully handle broken or unauthorized images
export const onImageError = (e, fallback = "/hero-image.png") => {
  if (!e?.currentTarget) return;
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return; // prevent infinite loop
  img.dataset.fallbackApplied = "true";
  img.src = fallback;
};

export const safe = (v) => (typeof v === "string" ? v : v ? String(v) : "");

export const matchesPropertyFilter = (property, filter) => {
  const q = safe(filter).trim().toLowerCase();
  if (!q) return true;
  const title = safe(property?.title).toLowerCase();
  const city = safe(property?.city).toLowerCase();
  const country = safe(property?.country).toLowerCase();
  const address = safe(property?.address).toLowerCase();
  return (
    title.includes(q) || city.includes(q) || country.includes(q) || address.includes(q)
  );
};