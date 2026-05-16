import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Text,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Avatar,
  VStack,
  useColorMode,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Spacer,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Divider,
  Icon,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaRoute, FaBars, FaSignOutAlt, FaMoon, FaSun, FaPlane, FaUser, FaBuilding, FaCog } from "react-icons/fa";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BiWallet } from "react-icons/bi";
import { BsHouseDoor, BsStar, BsEnvelope } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { GoShieldLock } from "react-icons/go";
import { BiCar } from "react-icons/bi";
import LogoPena from "../assets/penaLogo.png";
import LogoAset from "../assets/asetLogo.png";
import LogoPegawai from "../assets/pegawaiLogo.png";
import LogoPerencanaan from "../assets/perencanaanLogo.png";
import {
  selectIsAuthenticated,
  userRedux,
  selectRole,
  performLogout,
} from "../Redux/Reducers/auth";
import Logo from "../assets/logo.png";
import { HiOutlineUsers } from "react-icons/hi2";
import { io } from "socket.io-client";
import { useColorModeValues } from "../Style/colorModeValues";
import { FaBell } from "react-icons/fa";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

// Data menu untuk mapping
const menuData = [
  {
    title: "Kendaraan",
    icon: BiCar,
    pathPrefix: "/kendaraan",
    items: [
      { label: "Kendaraan Saya", path: "/kendaraan/kendaraan-saya" },
      { label: "Perjalanan", path: "/kendaraan/perjalanan" },
      {
        label: "Daftar Perjalanan",
        path: "/kendaraan/daftar-perjalanan-kendaraan",
      },
      { label: "Admin Kendaraan", path: "/kendaraan/daftar-kendaraan" },
    ],
  },
  {
    title: "Perjalanan",
    icon: FaPlane,
    pathPrefix: "/perjalanan",
    items: [
      { label: "Perjalanan", path: "/perjalanan" },
      { label: "Daftar Perjalanan", path: "/perjalanan/daftar" },
      { label: "Kwitansi Global", path: "/perjalanan/kwitansi-global" },
      { label: "Rekap Perjalanan", path: "/perjalanan/rekap" },
      { label: "Perjalanan Kepala Dinas", path: "/perjalanan/kalender-kadis" },
    ],
  },
  {
    title: "Keuangan",
    icon: BiWallet,
    pathPrefix: "/keuangan",
    items: [
      {
        label: "Dashboard Keuangan",
        path: "/keuangan/dashboard",
      },
      {
        label: "Daftar Kwitansi Global",
        path: "/keuangan/daftar-kwitansi-global",
      },
      { label: "Daftar Perjalanan", path: "/keuangan/daftar-perjalanan" },
      { label: "Perjalanan Pegawai", path: "/keuangan/perjalanan-pegawai" },
      { label: "Template Keuangan", path: "/keuangan/template" },
      { label: "Daftar Tujuan Dalam Kota", path: "/keuangan/dalam-kota" },
      { label: "Sumber Dana", path: "/keuangan/sumber-dana" },
      { label: "verifikasi Template BPD", path: "/keuangan/template-bpd" },
    ],
  },
  // {
  //   title: "Kepegawaian",
  //   icon: HiOutlineUsers,
  //   pathPrefix: "/kepegawaian",
  //   items: [
  //     { label: "Daftar Pegawai", path: "/kepegawaian/daftar-pegawai" },
  //     { label: "Statistik Pegawai", path: "/kepegawaian/statistik-pegawai" },
  //     { label: "Data Saya", path: "/kepegawaian/profile" },
  //     { label: "Usulan Pegawai", path: "/kepegawaian/usulan" },
  //   ],
  // },
  {
    title: "Kepala Dinas",
    icon: FaUser,
    pathPrefix: "/kepala-dinas",
    items: [
      { label: "Perjalanan", path: "/kepala-dinas/perjalanan-kadis" },
      { label: "Daftar Perjalanan", path: "/kepala-dinas/daftar-kadis" },
      { label: "Template Surat Tugas", path: "/kepala-dinas/template-kadis" },
    ],
  },
  {
    title: "Unit Kerja",
    icon: FaBuilding,
    pathPrefix: "/unit-kerja",
    items: [
      { label: "Induk Unit Kerja", path: "/unit-kerja/induk-unit-kerja" },
      { label: "Daftar Pegawai", path: "/unit-kerja/daftar-pegawai" },
      { label: "Daftar Bendahara", path: "/unit-kerja/daftar-bendahara" },
      { label: "Template Surat", path: "/unit-kerja/template" },
      { label: "Sub Kegiatan", path: "/unit-kerja/sub-kegiatan" },
      { label: "Tujuan Dalam Kota", path: "/unit-kerja/dalam-kota" },
      {label:"Template BPD", path:"/unit-kerja/template-bpd"}
    ],
  },
  {
    title: "Surat",
    icon: BsEnvelope,
    pathPrefix: "/surat",
    items: [
      { label: "Pengaturan", path: "/surat/nomor" },
      { label: "Daftar Surat Keluar", path: "/surat/surat-keluar" },
      { label: "Daftar SPPD", path: "/surat/sppd" },
      { label: "Daftar Surat Tugas", path: "/surat/surat-tugas" },
    ],
  },
  {
    title: "Administrator",
    icon: FaCog,
    pathPrefix: "/admin",
    items: [
      { label: "Jenis Surat", path: "/admin/edit-jenis-surat" },
      { label: "Tambah pengguna", path: "/admin/tambah-user" },
      { label: "Daftar Pengguna", path: "/admin/daftar-user" },
      {
        label: "Daftar Induk Unit Kerja",
        path: "/admin/daftar-induk-unit-kerja",
      },
    ],
  },
];

function Navbar() {
  const isAuthenticated =
    useSelector(selectIsAuthenticated) || localStorage.getItem("token");
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const { colorMode, toggleColorMode } = useColorMode();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const [jumlahNotifikasi, setJumlahNotifikasi] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [accordionIndex, setAccordionIndex] = useState(-1);
  const [notifikasiList, setNotifikasiList] = useState([]);
  const [isNotifikasiOpen, setIsNotifikasiOpen] = useState(false);
  // State untuk 2 jenis notifikasi: pengajuan dan ditolak
  const [notifikasiPengajuan, setNotifikasiPengajuan] = useState({
    count: 0,
    message: "",
  });
  const [notifikasiDitolak, setNotifikasiDitolak] = useState({
    count: 0,
    message: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const toast = useToast();

  // Check apakah user memiliki role keuangan (roleId: 3)
  // Notifikasi hanya muncul untuk user dengan role keuangan
  const hasKeuanganRole = React.useMemo(() => {
    if (!role || !Array.isArray(role)) return false;
    // Extract roleIds dari array role objects
    const userRoleIds = role.map((roleObj) => roleObj.roleId || roleObj.id);
    // Check apakah user memiliki roleId 3 (keuangan)
    return userRoleIds.includes(3);
  }, [role]);

  // Fetch foto profile
  const fetchProfilePic = useCallback(async () => {
    if (!isAuthenticated || !user || !user[0]?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/user/profile/${
          user[0].id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.result?.profilePic) {
        setProfilePic(response.data.result.profilePic);
      }
    } catch (error) {
      console.error("Error fetching profile pic:", error);
    }
  }, [isAuthenticated, user]);

  // Fetch foto profile saat mount atau saat authenticated berubah
  useEffect(() => {
    if (isAuthenticated && user && user[0]?.id) {
      fetchProfilePic();
    } else {
      setProfilePic(null);
    }
  }, [isAuthenticated, user, fetchProfilePic]);

  // Refresh foto profile saat kembali ke halaman (misalnya setelah upload foto)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && user && user[0]?.id) {
        fetchProfilePic();
      }
    };

    // Refresh saat window focus (user kembali ke tab)
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, user, fetchProfilePic]);

  // Color mode values untuk mobile drawer (dari Style folder)
  const {
    drawerBg,
    boxBg,
    textColor,
    textColorLight,
    borderColor,
    borderColorLight,
    borderColorDark,
    hoverBg,
    hoverBgWhite,
    accordionPanelBg,
    footerBoxShadow,
  } = useColorModeValues();

  const handleLogout = () => {
    dispatch(performLogout());
    setIsDrawerOpen(false);
  };

  // Fetch daftar notifikasi dari API
  const fetchNotifikasi = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/notifikasi/get`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // PENTING: SELALU update count dengan nilai dari backend (sumber kebenaran)
      // Count akan tetap sama jika tidak ada perubahan statusId di database
      // Jangan mengurangi count berdasarkan "user sudah melihat" atau "dropdown dibuka"
      // Count = jumlah personil dengan statusId == 2 (pengajuan) + statusId == 4 (ditolak)
      // Count HANYA berubah jika backend mengirim update melalui socket.io atau ada perubahan di database
      // Membuka dropdown notifikasi TIDAK akan mengurangi count

      // Update total count
      if (
        response.data.count !== undefined ||
        response.data.total !== undefined
      ) {
        const backendCount = response.data.total || response.data.count;
        console.log("📊 Count dari backend:", backendCount);
        setJumlahNotifikasi(backendCount);
      }

      // Update notifikasi pengajuan (statusId == 2)
      if (response.data.pengajuan !== undefined) {
        setNotifikasiPengajuan({
          count: response.data.pengajuan.count || response.data.pengajuan,
          message: response.data.pengajuan.message || "",
        });
      }

      // Update notifikasi ditolak (statusId == 4)
      if (response.data.ditolak !== undefined) {
        setNotifikasiDitolak({
          count: response.data.ditolak.count || response.data.ditolak,
          message: response.data.ditolak.message || "",
        });
      }

      // Jika response berisi daftar notifikasi, update state
      if (response.data.notifikasi) {
        setNotifikasiList(response.data.notifikasi);
      }
    } catch (error) {
      console.error("Error fetching notifikasi:", error);
    }
  }, []);

  // Inisialisasi Socket.io dan listener notifikasi
  // HANYA untuk user dengan role keuangan (roleId: 3)
  useEffect(() => {
    if (!isAuthenticated || !hasKeuanganRole) return;

    // Gunakan environment variable untuk URL socket.io
    const socketUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

    // Validasi: Pastikan environment variable sudah diset (penting untuk produksi)
    if (!socketUrl) {
      console.error(
        "⚠️ VITE_REACT_APP_API_BASE_URL tidak diset! Socket.io tidak dapat terhubung."
      );
      return; // Jangan inisialisasi socket jika URL tidak ada
    }

    // Peringatan jika masih menggunakan localhost di produksi
    if (socketUrl.includes("localhost") && import.meta.env.PROD) {
      console.warn(
        "⚠️ PERINGATAN: Menggunakan localhost di produksi! Pastikan environment variable sudah diset dengan benar."
      );
    }

    const socket = io(socketUrl, {
      transports: ["websocket"],
    });

    // Listener untuk notifikasi baru
    const handleNotifikasi = (data) => {
      console.log("📡 Notifikasi baru diterima di React:", data);

      // Update total count
      if (data.count !== undefined) {
        setJumlahNotifikasi((prevCount) => {
          const newCount = data.count;

          // PENTING: SELALU update count dengan nilai dari backend (sumber kebenaran)
          // Count akan tetap sama jika tidak ada perubahan statusId di database
          // Count HANYA berubah jika backend mengirim update melalui socket.io atau ada perubahan di database
          // Membuka dropdown notifikasi TIDAK akan mengurangi count

          // Tampilkan toast notification hanya jika count bertambah (ada notifikasi baru)
          if (newCount > prevCount && data.message) {
            toast({
              title: "Notifikasi Baru",
              description: data.message || "Anda memiliki notifikasi baru",
              status: "info",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
          }

          // Return newCount dari backend
          // Jika tidak ada perubahan di database, newCount akan sama dengan prevCount
          // Tapi kita tetap return newCount untuk memastikan sinkronisasi dengan backend
          return newCount;
        });
      }

      // Update notifikasi pengajuan (statusId == 2)
      if (data.pengajuan !== undefined) {
        setNotifikasiPengajuan({
          count: data.pengajuan.count || 0,
          message: data.pengajuan.message || "",
        });
      }

      // Update notifikasi ditolak (statusId == 4)
      if (data.ditolak !== undefined) {
        setNotifikasiDitolak({
          count: data.ditolak.count || 0,
          message: data.ditolak.message || "",
        });
      }

      // Fetch ulang daftar notifikasi jika dropdown sedang terbuka
      // Ini hanya untuk refresh list, count sudah diupdate di atas dari data.count
      // Membuka dropdown TIDAK akan mengurangi count
      if (isNotifikasiOpen) {
        fetchNotifikasi();
      }
    };

    socket.on("notifikasi:terbaru", handleNotifikasi);

    // Connect event
    socket.on("connect", () => {
      console.log("✅ Socket.io connected:", socket.id);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("❌ Socket.io disconnected");
    });

    // Cleanup
    return () => {
      socket.off("notifikasi:terbaru", handleNotifikasi);
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [
    isAuthenticated,
    hasKeuanganRole,
    toast,
    fetchNotifikasi,
    isNotifikasiOpen,
  ]);

  // Fetch count dan daftar notifikasi saat komponen mount atau saat user sudah authenticated
  // HANYA untuk user dengan role keuangan (roleId: 3)
  // Ini untuk memastikan count dan daftar notifikasi selalu tersedia bahkan setelah berpindah halaman
  useEffect(() => {
    if (isAuthenticated && hasKeuanganRole) {
      // Fetch count dan daftar notifikasi saat pertama kali mount atau saat authenticated berubah
      // Ini memastikan notifikasi tersedia sejak awal dan tidak hilang saat user berpindah halaman
      // Hanya untuk user dengan role keuangan
      fetchNotifikasi();
    } else {
      // Reset state jika user logout atau tidak memiliki role keuangan
      setJumlahNotifikasi(0);
      setNotifikasiList([]);
      setNotifikasiPengajuan({ count: 0, message: "" });
      setNotifikasiDitolak({ count: 0, message: "" });
    }
  }, [isAuthenticated, hasKeuanganRole, fetchNotifikasi]);

  // Fetch notifikasi saat dropdown dibuka (refresh daftar notifikasi)
  // HANYA untuk user dengan role keuangan (roleId: 3)
  // CATATAN: Fungsi ini untuk refresh daftar notifikasi saat dropdown dibuka
  // Count tidak akan berkurang - selalu mengikuti nilai dari backend
  // Count hanya berubah jika backend mengirim update melalui socket.io atau jika ada perubahan di database
  useEffect(() => {
    if (isNotifikasiOpen && isAuthenticated && hasKeuanganRole) {
      // Refresh daftar notifikasi saat dropdown dibuka
      // Hanya untuk user dengan role keuangan
      fetchNotifikasi();
    }
  }, [isNotifikasiOpen, isAuthenticated, hasKeuanganRole, fetchNotifikasi]);

  // Fungsi untuk mengecek apakah menu sedang aktif
  const isMenuActive = (menu) => {
    if (!menu.pathPrefix) return false;
    return location.pathname.startsWith(menu.pathPrefix);
  };

  // Fungsi untuk mengecek apakah item menu sedang aktif
  const isItemActive = (itemPath) => {
    return location.pathname === itemPath;
  };

  // Komponen untuk menu item
  const MenuItemComponent = ({ item, onItemClick }) => {
    if (!item || !item.path || !item.label) {
      return null;
    }

    const isActive = isItemActive(item.path);

    return (
      <Link to={item.path} onClick={onItemClick}>
        <Box
          px={4}
          py={3}
          borderRadius="xl"
          bg={isActive ? "primary" : "transparent"}
          color={isActive ? "white" : "gray.700"}
          fontWeight={isActive ? "700" : "600"}
          fontSize="14px"
          position="relative"
          overflow="hidden"
          _hover={{
            bg: isActive ? "primaryGelap" : "gray.50",
            transform: "translateX(6px)",
            boxShadow: isActive
              ? "0 4px 12px rgba(55, 176, 134, 0.3)"
              : "0 2px 8px rgba(0, 0, 0, 0.08)",
            _before: {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              bg: isActive ? "white" : "primary",
              borderRadius: "0 4px 4px 0",
            },
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          borderLeft={isActive ? "4px solid" : "4px solid transparent"}
          borderColor={isActive ? "white" : "transparent"}
          mx={1}
        >
          {item.label}
        </Box>
      </Link>
    );
  };

  // Komponen untuk menu dropdown
  const MenuDropdown = ({ menu }) => {
    if (!menu || !menu.title || !menu.items || !Array.isArray(menu.items)) {
      return null;
    }

    const IconComponent = menu.icon;
    const isActive = isMenuActive(menu);

    // State untuk hover dan klik
    const [isOpen, setIsOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // Handler untuk toggle saat diklik
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newState = !isOpen;
      setIsOpen(newState);
      setIsClicked(newState);
    };

    // Handler untuk mouse enter (hover)
    const handleMouseEnter = () => {
      setIsOpen(true);
    };

    // Handler untuk mouse leave (hanya tutup jika tidak diklik)
    const handleMouseLeave = () => {
      if (!isClicked) {
        setIsOpen(false);
      }
    };

    // Handler untuk menutup saat klik di luar
    const handleClose = () => {
      setIsOpen(false);
      setIsClicked(false);
    };

    // Handler untuk menutup saat item menu diklik
    const handleItemClick = () => {
      // Tidak menutup submenu saat item diklik, biarkan user navigasi
      // Submenu akan menutup otomatis saat klik di luar (closeOnBlur)
    };

    return (
      <Popover
        placement="bottom"
        isOpen={isOpen}
        onClose={handleClose}
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <Button
            variant="ghost"
            leftIcon={<IconComponent />}
            position="relative"
            color={isActive ? "primary" : "gray.700"}
            fontWeight={isActive ? "600" : "500"}
            fontSize="14px"
            px={4}
            py={2}
            bg="transparent"
            _hover={{
              bg: "gray.50",
              color: "primary",
            }}
            _active={{
              bg: "gray.100",
            }}
            transition="all 0.2s ease"
            borderBottom={isActive ? "2px solid" : "2px solid transparent"}
            borderColor={isActive ? "primary" : "transparent"}
            borderRadius="0"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {menu.title}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          mt={3}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          backdropFilter="blur(20px)"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            bgGradient: "linear(to-r, primary, primaryGelap)",
          }}
        >
          <PopoverArrow
            bg="white"
            borderColor="gray.200"
            borderWidth="1px"
            borderTop="none"
            borderLeft="none"
          />
          <PopoverBody p={2}>
            <VStack spacing={0.5} align="stretch">
              {menu.items.map((item, index) => (
                <MenuItemComponent
                  key={index}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      {/* Main Navbar */}
      <Box position="fixed" top={0} left={0} right={0} zIndex={999}>
        {/* Header dengan Background Putih */}
        <Box
          bg="white"
          px={{ base: 4, md: 6, lg: 8 }}
          py={4}
          minH="70px"
          boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
          position="relative"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          {/* Container untuk konten navbar */}
          <Flex
            w="100%"
            px={{ base: 4, md: 6, lg: 8 }}
            justifyContent="space-between"
            alignItems="center"
            gap={4}
            flexWrap="nowrap"
            position="relative"
          >
            {/* Left Section: Logo */}
            <Flex
              gap={3}
              alignItems="center"
              flexShrink={0}
              position="relative"
              zIndex={1}
            >
              {/* Logo dan Brand */}
              <Flex gap={3} alignItems="center" flexShrink={0}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  h="32px"
                >
                  <Image height="100%" src={LogoPena} alt="Logo Pena" />
                </Box>
                <Box
                  w="48px"
                  h="48px"
                
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  p={2}
                >
                  <Image height="100%" src={Logo} alt="Logo Dinas Kesehatan" />
                </Box>
                <Box display={{ base: "none", sm: "block" }}>
                  <Text
                    color="gray.800"
                    fontSize={{ base: "16px", md: "18px" }}
                    fontWeight={700}
                    letterSpacing="0.2px"
                  >
                    Dinas Kesehatan
                  </Text>
                  <Text
                    color="gray.600"
                    fontSize={{ base: "12px", md: "13px" }}
                    fontWeight={400}
                    letterSpacing="0.1px"
                    mt={0.5}
                  >
                    Kabupaten Paser
                  </Text>
                </Box>
              </Flex>
            </Flex>

            {/* Center Section: Menu Navigation - Hidden on mobile, positioned absolutely in center */}
            <Box
              display={{ base: "none", lg: "block" }}
              position="absolute"
              left="50%"
              transform="translateX(-50%)"
              zIndex={1}
            >
              <HStack spacing={1} justifyContent="center">
                {menuData.map((menu, index) => (
                  <MenuDropdown key={index} menu={menu} />
                ))}
              </HStack>
            </Box>

            {/* Right Section: User Menu (Desktop) dan Hamburger (Mobile) */}
            <HStack spacing={3} flexShrink={0} position="relative" zIndex={1} ml="auto">
              {/* Color Mode Toggle - Hidden on mobile */}
              <IconButton
                display={{ base: "none", lg: "flex" }}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                icon={<Icon as={colorMode === "light" ? FaMoon : FaSun} />}
                size="md"
                variant="ghost"
                color="gray.700"
                borderRadius="md"
                _hover={{
                  bg: "gray.100",
                  color: "primary",
                }}
                transition="all 0.2s ease"
              />

              {/* Notifikasi Bell Icon - Desktop & Mobile */}
              {/* Hanya tampilkan untuk user dengan role keuangan (roleId: 3) */}
              {isAuthenticated && hasKeuanganRole && (
                <Popover
                  placement="bottom-end"
                  isOpen={isNotifikasiOpen}
                  onOpen={() => setIsNotifikasiOpen(true)}
                  onClose={() => setIsNotifikasiOpen(false)}
                  closeOnBlur={true}
                >
                  <PopoverTrigger>
                    <Box
                      position="relative"
                      display={{ base: "none", lg: "block" }}
                    >
                      <IconButton
                        aria-label="Notifikasi"
                        icon={<Icon as={FaBell} />}
                        size="md"
                        variant="ghost"
                        color="gray.700"
                        borderRadius="md"
                        _hover={{
                          bg: "gray.100",
                          color: "primary",
                        }}
                        transition="all 0.2s ease"
                      />
                      {jumlahNotifikasi > 0 && (
                        <Badge
                          position="absolute"
                          top="-2"
                          right="-2"
                          bg="red.500"
                          color="white"
                          fontSize="10px"
                          fontWeight="bold"
                          borderRadius="full"
                          minW="6"
                          h="6"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="0 2px 8px rgba(220, 38, 38, 0.4)"
                          border="2px solid white"
                          animation="pulse 2s infinite"
                        >
                          {jumlahNotifikasi > 9 ? "9+" : jumlahNotifikasi}
                        </Badge>
                      )}
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent
                    w="400px"
                    maxH="500px"
                    boxShadow="0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.200"
                    mt={3}
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      bgGradient: "linear(to-r, primary, primaryGelap)",
                    }}
                  >
                    <PopoverArrow
                      bg="white"
                      borderColor="gray.200"
                      borderWidth="1px"
                      borderTop="none"
                      borderLeft="none"
                    />
                    <PopoverBody p={0}>
                      <Box
                        p={4}
                        borderBottom="1px solid"
                        borderColor="gray.200"
                        bg="gray.50"
                      >
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontWeight="bold" fontSize="lg">
                            Notifikasi
                          </Text>
                          {jumlahNotifikasi > 0 && (
                            <Badge colorScheme="red" borderRadius="full">
                              {jumlahNotifikasi}
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                      <Box
                        maxH="400px"
                        overflowY="auto"
                        css={{
                          "&::-webkit-scrollbar": {
                            width: "8px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "#f1f1f1",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#888",
                            borderRadius: "4px",
                          },
                          "&::-webkit-scrollbar-thumb:hover": {
                            background: "#555",
                          },
                        }}
                      >
                        {jumlahNotifikasi === 0 ? (
                          <Box p={6} textAlign="center">
                            <Icon
                              as={FaBell}
                              boxSize={12}
                              color="gray.300"
                              mb={3}
                            />
                            <Text color="gray.500" fontSize="sm">
                              Tidak ada notifikasi
                            </Text>
                          </Box>
                        ) : (
                          <VStack spacing={0} align="stretch">
                            {/* Notifikasi Pengajuan Kwitansi */}
                            {notifikasiPengajuan.count > 0 && (
                              <Box
                                p={4}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                bg="blue.50"
                                borderLeft="4px solid"
                                borderLeftColor="blue.500"
                                _hover={{
                                  bg: "blue.100",
                                }}
                                cursor="pointer"
                                transition="all 0.2s ease"
                              >
                                <Flex
                                  justifyContent="space-between"
                                  alignItems="start"
                                  mb={1}
                                >
                                  <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color="blue.700"
                                  >
                                    Pengajuan Kwitansi
                                  </Text>
                                  <Badge
                                    colorScheme="blue"
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    {notifikasiPengajuan.count}
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.700" mt={1}>
                                  {notifikasiPengajuan.message ||
                                    `Ada ${notifikasiPengajuan.count} pengajuan kwitansi`}
                                </Text>
                              </Box>
                            )}

                            {/* Notifikasi Kwitansi Ditolak */}
                            {notifikasiDitolak.count > 0 && (
                              <Box
                                p={4}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                bg="red.50"
                                borderLeft="4px solid"
                                borderLeftColor="red.500"
                                _hover={{
                                  bg: "red.100",
                                }}
                                cursor="pointer"
                                transition="all 0.2s ease"
                              >
                                <Flex
                                  justifyContent="space-between"
                                  alignItems="start"
                                  mb={1}
                                >
                                  <Text
                                    fontWeight="bold"
                                    fontSize="sm"
                                    color="red.700"
                                  >
                                    Kwitansi Ditolak
                                  </Text>
                                  <Badge
                                    colorScheme="red"
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    {notifikasiDitolak.count}
                                  </Badge>
                                </Flex>
                                <Text fontSize="sm" color="gray.700" mt={1}>
                                  {notifikasiDitolak.message ||
                                    `Ada ${notifikasiDitolak.count} kwitansi yang ditolak`}
                                </Text>
                              </Box>
                            )}

                            {/* Fallback: Tampilkan daftar notifikasi jika ada */}
                            {notifikasiList.length > 0 &&
                              notifikasiPengajuan.count === 0 &&
                              notifikasiDitolak.count === 0 &&
                              notifikasiList.map((notif, index) => (
                                <Box
                                  key={index}
                                  p={4}
                                  borderBottom="1px solid"
                                  borderColor="gray.100"
                                  _hover={{
                                    bg: "gray.50",
                                  }}
                                  cursor="pointer"
                                  transition="all 0.2s ease"
                                >
                                  <Text
                                    fontWeight="medium"
                                    fontSize="sm"
                                    mb={1}
                                  >
                                    {notif.message || "Notifikasi baru"}
                                  </Text>
                                  {notif.timestamp && (
                                    <Text color="gray.500" fontSize="xs">
                                      {new Date(notif.timestamp).toLocaleString(
                                        "id-ID"
                                      )}
                                    </Text>
                                  )}
                                </Box>
                              ))}

                            {/* Fallback: Jika tidak ada notifikasi spesifik tapi ada count */}
                            {notifikasiPengajuan.count === 0 &&
                              notifikasiDitolak.count === 0 &&
                              notifikasiList.length === 0 &&
                              jumlahNotifikasi > 0 && (
                                <Box p={4}>
                                  <Text fontSize="sm" color="gray.600">
                                    Anda memiliki {jumlahNotifikasi} notifikasi
                                    baru
                                  </Text>
                                </Box>
                              )}
                          </VStack>
                        )}
                      </Box>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              )}

              {/* Separator */}
              <Box
                display={{ base: "none", lg: "block" }}
                w="1px"
                h="32px"
                bg="gray.300"
                mx={2}
              />

              {/* User Menu - Hidden on mobile, shown on desktop */}
              {isAuthenticated ? (
                <>
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="md"
                      display={{ base: "none", lg: "flex" }}
                      px={2}
                      py={1}
                      _hover={{
                        bg: "transparent",
                      }}
                      _active={{
                        bg: "transparent",
                      }}
                    >
                      <HStack spacing={3}>
                        <VStack spacing={0} align="flex-end" mr={2}>
                          <Text
                            color="gray.800"
                            fontSize="14px"
                            fontWeight="600"
                            lineHeight="1.2"
                          >
                            {user[0]?.nama || "admin dinkes"}
                          </Text>
                          <Text
                            color="gray.600"
                            fontSize="12px"
                            fontWeight="400"
                            lineHeight="1.2"
                          >
                            Administrator
                          </Text>
                        </VStack>
                        <Avatar
                          size="sm"
                          name={user[0]?.nama || "AD"}
                          src={
                            profilePic
                              ? `${
                                  import.meta.env.VITE_REACT_APP_API_BASE_URL
                                }${profilePic}`
                              : undefined
                          }
                          bg="primary"
                          color="white"
                          border="none"
                        />
                      </HStack>
                    </MenuButton>
                    <MenuList
                      boxShadow="0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)"
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="gray.200"
                      mt={3}
                      overflow="hidden"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        bgGradient: "linear(to-r, primary, primaryGelap)",
                      }}
                    >
                      <Box px={4} py={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                        <Text fontSize="11px" color="gray.500">
                          Penomoran:{" "}
                          <Text
                            as="span"
                            color={
                              user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran === "aktif"
                                ? "green.600"
                                : "gray.500"
                            }
                            fontWeight="500"
                          >
                            {user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran || "-"}
                          </Text>
                          {" · "}
                          Keuangan:{" "}
                          <Text
                            as="span"
                            color={
                              user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan === "aktif"
                                ? "green.600"
                                : "gray.500"
                            }
                            fontWeight="500"
                          >
                            {user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan || "-"}
                          </Text>
                        </Text>
                      </Box>
                      <Link to={"/profile"}>
                        <MenuItem
                          icon={
                            <Avatar
                              size="xs"
                              name={user[0]?.nama}
                              src={
                                profilePic
                                  ? `${
                                      import.meta.env
                                        .VITE_REACT_APP_API_BASE_URL
                                    }${profilePic}`
                                  : undefined
                              }
                            />
                          }
                          _hover={{
                            bg: "gray.50",
                            transform: "translateX(4px)",
                            transition: "all 0.2s ease",
                          }}
                          borderRadius="lg"
                          transition="all 0.2s ease"
                        >
                          Profile
                        </MenuItem>
                      </Link>
                      <Link to={"/"}>
                        <MenuItem
                          icon={<Image h={"20px"} src={LogoPena} />}
                          _hover={{
                            bg: "gray.50",
                            transform: "translateX(4px)",
                            transition: "all 0.2s ease",
                          }}
                          borderRadius="lg"
                          transition="all 0.2s ease"
                        >
                          Pena
                        </MenuItem>
                      </Link>
                      <Link to={"/aset/dashboard"}>
                        <MenuItem
                          icon={<Image h={"20px"} src={LogoAset} />}
                          _hover={{
                            bg: "gray.50",
                            transform: "translateX(4px)",
                            transition: "all 0.2s ease",
                          }}
                          borderRadius="lg"
                          transition="all 0.2s ease"
                        >
                          Aset
                        </MenuItem>
                      </Link>
                      <Link to={"/pegawai/dashboard"}>
                        <MenuItem
                          icon={<Image h={"20px"} src={LogoPegawai} />}
                          _hover={{
                            bg: "gray.50",
                            transform: "translateX(4px)",
                            transition: "all 0.2s ease",
                          }}
                          borderRadius="lg"
                          transition="all 0.2s ease"
                        >
                          Kepegawaian
                        </MenuItem>
                      </Link>
                      <Link to={"/perencanaan"}>
                        <MenuItem
                          icon={<Image h={"20px"} src={LogoPerencanaan} />}
                          _hover={{
                            bg: "gray.50",
                            transform: "translateX(4px)",
                            transition: "all 0.2s ease",
                          }}
                          borderRadius="lg"
                          transition="all 0.2s ease"
                        >
                          Perencanaan
                        </MenuItem>
                      </Link>
                      <Box px={2} py={1}>
                        <Box
                          as="hr"
                          borderColor="gray.200"
                          borderWidth="1px"
                          my={1}
                        />
                      </Box>
                      <MenuItem
                        icon={<Icon as={FaSignOutAlt} />}
                        _hover={{
                          bg: "red.50",
                          color: "red.600",
                          transform: "translateX(4px)",
                          transition: "all 0.2s ease",
                        }}
                        onClick={handleLogout}
                        color="red.500"
                        fontWeight="700"
                        borderRadius="lg"
                        transition="all 0.2s ease"
                      >
                        Keluar
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Link to="/login">
                  <Button
                    variant={"primary"}
                    size="sm"
                    display={{ base: "none", lg: "flex" }}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s ease"
                  >
                    Login
                  </Button>
                </Link>
              )}

              {/* Hamburger Menu Button - Visible on mobile, positioned on right */}
              <IconButton
                display={{ base: "flex", lg: "none" }}
                aria-label="Open menu"
                icon={<FaBars />}
                size="md"
                variant="ghost"
                color="gray.700"
                onClick={() => setIsDrawerOpen(true)}
                _hover={{
                  bg: "gray.100",
                }}
                transition="all 0.2s ease"
              />
            </HStack>
          </Flex>
        </Box>
      </Box>
      {/* Mobile Drawer Menu */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent bg={boxBg}>
          <DrawerCloseButton color="white" />
          <DrawerHeader
            bgGradient="linear(to-r, primary, primaryGelap)"
            color="white"
            borderBottom="1px solid"
            borderColor="rgba(0,0,0,0.1)"
          >
            <Flex gap={3} alignItems="center">
              <Image height="32px" src={LogoPena} alt="Logo Pena" />
              <Image height="32px" src={Logo} alt="Logo Dinkes" />
              <Box>
                <Text fontSize="14px" fontWeight={700}>
                  Dinas Kesehatan
                </Text>
                <Text fontSize="12px" opacity={0.9}>
                  Kabupaten Paser
                </Text>
              </Box>
            </Flex>
          </DrawerHeader>

          <DrawerBody
            p={0}
            bg={drawerBg}
            display="flex"
            flexDirection="column"
            maxH="calc(100vh - 60px)"
            overflow="hidden"
          >
            {/* User Profile Section - Mobile Only */}
            {isAuthenticated ? (
              <>
                <Box
                  bgGradient="linear(to-r, primary, primaryGelap)"
                  color="white"
                  p={5}
                  borderBottom="2px solid"
                  borderColor="rgba(255,255,255,0.1)"
                  flexShrink={0}
                >
                  <Flex gap={3} alignItems="center" mb={4}>
                    <Box position="relative">
                      <Avatar
                        size="lg"
                        name={user[0]?.nama}
                        src={
                          profilePic
                            ? `${
                                import.meta.env.VITE_REACT_APP_API_BASE_URL
                              }${profilePic}`
                            : undefined
                        }
                        border="3px solid"
                        borderColor="rgba(255, 255, 255, 0.4)"
                        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                      />
                      {jumlahNotifikasi > 0 && (
                        <Badge
                          position="absolute"
                          top="-2"
                          right="-2"
                          bg="red.500"
                          color="white"
                          fontSize="11px"
                          fontWeight="bold"
                          borderRadius="full"
                          minW="7"
                          h="7"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="0 2px 8px rgba(0,0,0,0.3)"
                          border="2px solid white"
                        >
                          {jumlahNotifikasi > 9 ? "9+" : jumlahNotifikasi}
                        </Badge>
                      )}
                    </Box>
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontSize="lg" fontWeight={700}>
                        {user[0]?.nama || "User"}
                      </Text>
                      <Text fontSize="sm" opacity={0.9}>
                        {user[0]?.email || ""}
                      </Text>
                    </VStack>
                  </Flex>

                  {/* Profile Button */}
                  <Link to="/profile" onClick={() => setIsDrawerOpen(false)}>
                    <Button
                      w="full"
                      variant="outline"
                      colorScheme="whiteAlpha"
                      size="md"
                      leftIcon={
                        <Avatar
                          size="xs"
                          name={user[0]?.nama}
                          src={
                            profilePic
                              ? `${
                                  import.meta.env.VITE_REACT_APP_API_BASE_URL
                                }${profilePic}`
                              : undefined
                          }
                        />
                      }
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.25)",
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                      }}
                      transition="all 0.2s ease"
                      mb={3}
                    >
                      Lihat Profile
                    </Button>
                  </Link>
                </Box>

                {/* Penomoran & Keuangan */}
                <Box px={4} py={2} bg={boxBg} borderBottom="1px solid" borderColor={borderColor}>
                  <Text fontSize="xs" color={textColorLight}>
                    Penomoran:{" "}
                    <Text
                      as="span"
                      color={
                        user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran === "aktif"
                          ? "green.500"
                          : undefined
                      }
                      fontWeight="500"
                    >
                      {user[0]?.unitKerja_profile?.indukUnitKerja?.penomoran || "-"}
                    </Text>
                    {" · "}
                    Keuangan:{" "}
                    <Text
                      as="span"
                      color={
                        user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan === "aktif"
                          ? "green.500"
                          : undefined
                      }
                      fontWeight="500"
                    >
                      {user[0]?.unitKerja_profile?.indukUnitKerja?.keuangan || "-"}
                    </Text>
                  </Text>
                </Box>

                {/* Quick Actions Section */}
                <Box
                  p={4}
                  bg={boxBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  flexShrink={0}
                >
                  <Text
                    fontSize="xs"
                    fontWeight={700}
                    color={textColorLight}
                    textTransform="uppercase"
                    letterSpacing="wide"
                    mb={3}
                  >
                    Aplikasi Lain
                  </Text>
                  <SimpleGrid columns={2} spacing={2}>
                    <Link to="/" onClick={() => setIsDrawerOpen(false)}>
                      <Button
                        w="full"
                        variant="outline"
                        size="sm"
                        leftIcon={<Image h={"18px"} src={LogoPena} />}
                        _hover={{
                          bg: hoverBg,
                          borderColor: "primary",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        Pena
                      </Button>
                    </Link>
                    <Link
                      to="/aset/dashboard"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button
                        w="full"
                        variant="outline"
                        size="sm"
                        leftIcon={<Image h={"18px"} src={LogoAset} />}
                        _hover={{
                          bg: hoverBg,
                          borderColor: "primary",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        Aset
                      </Button>
                    </Link>
                    <Link
                      to="/pegawai/dashboard"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button
                        w="full"
                        variant="outline"
                        size="sm"
                        leftIcon={<Image h={"18px"} src={LogoPegawai} />}
                        _hover={{
                          bg: hoverBg,
                          borderColor: "primary",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        Kepegawaian
                      </Button>
                    </Link>
                    <Link
                      to="/perencanaan"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Button
                        w="full"
                        variant="outline"
                        size="sm"
                        leftIcon={<Image h={"18px"} src={LogoPerencanaan} />}
                        _hover={{
                          bg: hoverBg,
                          borderColor: "primary",
                          transform: "translateY(-2px)",
                        }}
                        transition="all 0.2s ease"
                      >
                        Perencanaan
                      </Button>
                    </Link>
                  </SimpleGrid>
                </Box>
              </>
            ) : (
              <Box
                p={5}
                bg={boxBg}
                borderBottom="1px solid"
                borderColor={borderColor}
                flexShrink={0}
              >
                <Link to="/login" onClick={() => setIsDrawerOpen(false)}>
                  <Button
                    w="full"
                    variant="solid"
                    colorScheme="primary"
                    size="lg"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s ease"
                  >
                    Login
                  </Button>
                </Link>
              </Box>
            )}

            {/* Menu Navigation */}
            <Box
              bg={boxBg}
              flex="1"
              overflowY="auto"
              minH={0}
              display="flex"
              flexDirection="column"
            >
              <Box
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor={borderColor}
                flexShrink={0}
              >
                <Text
                  fontSize="xs"
                  fontWeight={700}
                  color={textColorLight}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Menu
                </Text>
              </Box>
              <Accordion
                allowToggle
                index={accordionIndex}
                onChange={(index) => {
                  // Hanya satu accordion yang bisa terbuka pada satu waktu
                  setAccordionIndex(
                    Array.isArray(index)
                      ? index.length > 0
                        ? index[0]
                        : -1
                      : index
                  );
                }}
              >
                {menuData.map((menu, index) => {
                  const IconComponent = menu.icon;
                  const isActive = isMenuActive(menu);

                  return (
                    <AccordionItem
                      key={index}
                      border="none"
                      borderTop="1px solid"
                      borderColor={borderColorLight}
                    >
                      <AccordionButton
                        px={4}
                        py={3.5}
                        bg={isActive ? "primary" : boxBg}
                        color={isActive ? "white" : textColor}
                        fontWeight="600"
                        _hover={{
                          bg: isActive ? "primaryGelap" : hoverBg,
                        }}
                        borderLeft={
                          isActive ? "4px solid" : "4px solid transparent"
                        }
                        borderColor={isActive ? "primaryGelap" : "transparent"}
                        transition="all 0.2s ease"
                      >
                        <HStack flex="1" spacing={3}>
                          <Icon
                            as={IconComponent}
                            boxSize={5}
                            color={isActive ? "white" : "primary"}
                          />
                          <Text textAlign="left" fontSize="sm">
                            {menu.title}
                          </Text>
                        </HStack>
                        <AccordionIcon
                          color={isActive ? "white" : textColorLight}
                        />
                      </AccordionButton>
                      <AccordionPanel pb={3} px={0} bg={accordionPanelBg}>
                        <VStack spacing={1} align="stretch" px={2}>
                          {menu.items.map((item, itemIndex) => {
                            const itemIsActive = isItemActive(item.path);
                            return (
                              <Link
                                key={itemIndex}
                                to={item.path}
                                onClick={() => setIsDrawerOpen(false)}
                              >
                                <Box
                                  px={6}
                                  py={2.5}
                                  bg={itemIsActive ? "primary" : "transparent"}
                                  color={itemIsActive ? "white" : textColor}
                                  fontWeight={
                                    itemIsActive ? "semibold" : "medium"
                                  }
                                  fontSize="sm"
                                  borderRadius="md"
                                  _hover={{
                                    bg: itemIsActive
                                      ? "primaryGelap"
                                      : hoverBgWhite,
                                    transform: "translateX(4px)",
                                    boxShadow: itemIsActive ? "none" : "sm",
                                  }}
                                  transition="all 0.2s ease"
                                  borderLeft={
                                    itemIsActive
                                      ? "3px solid"
                                      : "3px solid transparent"
                                  }
                                  borderColor={
                                    itemIsActive ? "white" : "transparent"
                                  }
                                >
                                  {item.label}
                                </Box>
                              </Link>
                            );
                          })}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </Box>

            {/* Footer Section - Color Mode & Logout */}
            <Box
              borderTop="2px solid"
              borderColor={borderColorDark}
              bg={boxBg}
              boxShadow={footerBoxShadow}
              display={{ base: "block", lg: "none" }}
              flexShrink={0}
            >
              <Box p={4}>
                <HStack spacing={3}>
                  {/* Color Mode Toggle */}
                  <Button
                    flex="1"
                    variant="outline"
                    size="md"
                    leftIcon={
                      <Box
                        as="span"
                        fontSize="lg"
                        filter={
                          colorMode === "light" ? "none" : "grayscale(0%)"
                        }
                      >
                        {colorMode === "light" ? "🌙" : "☀️"}
                      </Box>
                    }
                    onClick={toggleColorMode}
                    justifyContent="center"
                    bg={colorMode === "light" ? "gray.900" : "yellow.100"}
                    color={colorMode === "light" ? "white" : "gray.800"}
                    borderColor={
                      colorMode === "light" ? "gray.700" : "yellow.300"
                    }
                    _hover={{
                      bg: colorMode === "light" ? "gray.800" : "yellow.200",
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s ease"
                  >
                    {colorMode === "light" ? "Gelap" : "Terang"}
                  </Button>

                  {/* Logout Button */}
                  {isAuthenticated && (
                    <Button
                      flex="1"
                      variant="outline"
                      colorScheme="red"
                      size="md"
                      leftIcon={<Icon as={FaSignOutAlt} />}
                      onClick={handleLogout}
                      _hover={{
                        bg: "red.50",
                        borderColor: "red.400",
                        transform: "translateY(-2px)",
                        boxShadow: "md",
                      }}
                      transition="all 0.2s ease"
                    >
                      Keluar
                    </Button>
                  )}
                </HStack>
              </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {/* Spacing untuk konten utama */}
      <Box h="70px" /> {/* Spacer untuk konten */}
    </>
  );
}

export default Navbar;
