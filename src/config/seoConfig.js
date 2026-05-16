// Konfigurasi SEO untuk berbagai halaman
export const seoConfig = {
  // Default SEO untuk semua halaman
  default: {
    title: "Dinas Kesehatan - Sistem Informasi Perjalanan Dinas",
    description:
      "Sistem informasi perjalanan dinas dan pengelolaan aset Dinas Kesehatan",
    image: "/src/assets/dinkes.jpg",
    organization: {
      name: "Dinas Kesehatan",
      url: typeof window !== "undefined" ? window.location.origin : "",
      logo: "/src/assets/Logo Pena.png",
      description: "Dinas Kesehatan - Melayani Masyarakat dengan Profesional",
      address: {
        streetAddress: "gedung perkantoran",
        addressLocality: "Tana Paser",
        addressRegion: "Kalimantan Timur",
        postalCode: "76211",
      },
      contactPoint: {
        telephone: "+62-543-21123",
        contactType: "customer service",
      },
    },
  },

  // SEO untuk halaman Home
  home: {
    title: "Pena Dinkes - Sistem Informasi Dinas Kesehatan Kabupaten Paser",
    description:
      "Pena Dinkes adalah aplikasi administrasi perjalanan dinas dan pengelolaan aset di Dinas Kesehatan Kabupaten Paser. Sistem terintegrasi untuk efisiensi pelayanan kesehatan.",
    image: "/src/assets/dinkes.jpg",
  },

  // SEO untuk halaman Dashboard
  dashboard: {
    title: "Dashboard - Pena Dinkes",
    description:
      "Dashboard utama sistem informasi perjalanan dinas dan pengelolaan aset Dinas Kesehatan Kabupaten Paser",
    image: "/src/assets/dinkes.jpg",
  },

  // SEO untuk halaman Perjalanan
  perjalanan: {
    title: "Perjalanan Dinas - Pena Dinkes",
    description:
      "Kelola dan monitor perjalanan dinas pegawai Dinas Kesehatan Kabupaten Paser dengan sistem terintegrasi",
    image: "/src/assets/dinkes.jpg",
  },

  // SEO untuk halaman Aset
  aset: {
    title: "Pengelolaan Aset - Pena Dinkes",
    description:
      "Sistem pengelolaan aset dan inventaris Dinas Kesehatan Kabupaten Paser untuk efisiensi administrasi",
    image: "/src/assets/dinkes.jpg",
  },

  // SEO untuk halaman Login
  login: {
    title: "Login - Pena Dinkes",
    description:
      "Masuk ke sistem informasi perjalanan dinas Dinas Kesehatan Kabupaten Paser",
    image: "/src/assets/dinkes.jpg",
  },

  // SEO untuk halaman Profile
  profile: {
    title: "Profile Pegawai - Pena Dinkes",
    description:
      "Kelola profile dan informasi pegawai Dinas Kesehatan Kabupaten Paser",
    image: "/src/assets/dinkes.jpg",
  },
};

// Helper function untuk menggabungkan konfigurasi
export const getSEOConfig = (page, customProps = {}) => {
  const baseConfig = seoConfig.default;
  const pageConfig = seoConfig[page] || {};

  return {
    ...baseConfig,
    ...pageConfig,
    ...customProps,
    url: typeof window !== "undefined" ? window.location.href : "",
    organization: {
      ...baseConfig.organization,
      ...pageConfig.organization,
      ...customProps.organization,
    },
  };
};
