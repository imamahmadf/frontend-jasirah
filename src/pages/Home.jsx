import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { keyframes, css } from "@emotion/react";
import {
  FaFileAlt,
  FaUsers,
  FaCar,
  FaChartLine,
  FaBuilding,
  FaClipboardList,
} from "react-icons/fa";
import Layout from "../Componets/Layout";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, userRedux } from "../Redux/Reducers/auth";
import FotoDinkes from "../assets/dinkes.jpg";
import { getSEOConfig } from "../config/seoConfig";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Animasi keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// CSS untuk animasi
const fadeInAnimation = css`
  animation: ${fadeIn} 1s ease-out;
`;

const fadeInAnimationDelay1 = css`
  animation: ${fadeIn} 1.2s ease-out;
`;

const fadeInAnimationDelay2 = css`
  animation: ${fadeIn} 1.4s ease-out;
`;

const slideInAnimation = (delay) => css`
  animation: ${slideIn} ${0.6 + delay * 0.1}s ease-out;
`;

const floatAnimation = css`
  animation: ${float} 2s ease-in-out infinite;
`;

const floatAnimationFast = css`
  animation: ${float} 1.5s ease-in-out infinite;
`;

function Home() {
  const isAuthenticated =
    useSelector(selectIsAuthenticated) || localStorage.getItem("token");
  const history = useHistory();
  const user = useSelector(userRedux);
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTahun, setFilterTahun] = useState(
    new Date().getFullYear().toString()
  );

  // Fetch data sub kegiatan untuk dashboard
  async function fetchDataSubKegiatan() {
    if (!user?.[0]?.unitKerja_profile?.id || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/sub-kegiatan/get/${
          user[0]?.unitKerja_profile?.id
        }?&filterTahun=${filterTahun}`
      );
      setDataSubKegiatan(res.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.[0]?.unitKerja_profile?.id) {
      fetchDataSubKegiatan();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filterTahun]);

  // Fungsi untuk memformat rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Fungsi untuk menyiapkan data grafik total anggaran vs realisasi
  const prepareAnggaranRealisasiData = () => {
    if (!dataSubKegiatan || dataSubKegiatan.length === 0) return null;

    const labels = dataSubKegiatan.map((item) => item.subKegiatan);
    const anggaranData = dataSubKegiatan.map((item) => {
      return (
        item.anggaranByTipe?.reduce(
          (sum, tipe) => sum + (tipe.anggaran || 0),
          0
        ) || 0
      );
    });
    const realisasiData = dataSubKegiatan.map((item) => {
      return (
        item.anggaranByTipe?.reduce(
          (sum, tipe) => sum + (tipe.totalRealisasi || 0),
          0
        ) || 0
      );
    });

    return {
      labels: labels,
      datasets: [
        {
          label: "Anggaran",
          data: anggaranData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
        {
          label: "Realisasi",
          data: realisasiData,
          backgroundColor: "rgba(34, 197, 94, 0.9)", // Hijau lebih terang dan solid
          borderColor: "rgba(22, 163, 74, 1)", // Border hijau lebih gelap
          borderWidth: 3, // Border lebih tebal
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data grafik persentase realisasi
  const preparePersentaseRealisasiData = () => {
    if (!dataSubKegiatan || dataSubKegiatan.length === 0) return null;

    const labels = dataSubKegiatan.map((item) => item.subKegiatan);
    const persentaseData = dataSubKegiatan.map((item) => {
      const totalAnggaran =
        item.anggaranByTipe?.reduce(
          (sum, tipe) => sum + (tipe.anggaran || 0),
          0
        ) || 0;
      const totalRealisasi =
        item.anggaranByTipe?.reduce(
          (sum, tipe) => sum + (tipe.totalRealisasi || 0),
          0
        ) || 0;
      return totalAnggaran > 0
        ? ((totalRealisasi / totalAnggaran) * 100).toFixed(2)
        : 0;
    });

    return {
      labels: labels,
      datasets: [
        {
          label: "Persentase Realisasi (%)",
          data: persentaseData,
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(22, 163, 74, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data grafik dalam daerah vs luar daerah
  const prepareTipePerjalananData = () => {
    if (!dataSubKegiatan || dataSubKegiatan.length === 0) return null;

    let totalDalamDaerah = 0;
    let totalLuarDaerah = 0;
    let realisasiDalamDaerah = 0;
    let realisasiLuarDaerah = 0;

    dataSubKegiatan.forEach((item) => {
      item.anggaranByTipe?.forEach((tipe) => {
        if (tipe.tipePerjalananId === 1) {
          totalDalamDaerah += tipe.anggaran || 0;
          realisasiDalamDaerah += tipe.totalRealisasi || 0;
        } else if (tipe.tipePerjalananId === 2) {
          totalLuarDaerah += tipe.anggaran || 0;
          realisasiLuarDaerah += tipe.totalRealisasi || 0;
        }
      });
    });

    return {
      labels: ["Dalam Daerah", "Luar Daerah"],
      datasets: [
        {
          label: "Anggaran",
          data: [totalDalamDaerah, totalLuarDaerah],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 2,
        },
        {
          label: "Realisasi",
          data: [realisasiDalamDaerah, realisasiLuarDaerah],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)"],
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menghitung total statistik
  const calculateTotals = () => {
    if (!dataSubKegiatan || dataSubKegiatan.length === 0)
      return {
        totalAnggaran: 0,
        totalRealisasi: 0,
        totalSisa: 0,
        persentase: 0,
      };

    let totalAnggaran = 0;
    let totalRealisasi = 0;

    dataSubKegiatan.forEach((item) => {
      item.anggaranByTipe?.forEach((tipe) => {
        totalAnggaran += tipe.anggaran || 0;
        totalRealisasi += tipe.totalRealisasi || 0;
      });
    });

    const totalSisa = totalAnggaran - totalRealisasi;
    const persentase =
      totalAnggaran > 0
        ? ((totalRealisasi / totalAnggaran) * 100).toFixed(2)
        : 0;

    return {
      totalAnggaran,
      totalRealisasi,
      totalSisa,
      persentase,
    };
  };

  const anggaranRealisasiData = prepareAnggaranRealisasiData();
  const persentaseRealisasiData = preparePersentaseRealisasiData();
  const tipePerjalananData = prepareTipePerjalananData();
  const totals = calculateTotals();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    indexAxis: "y", // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            // Format angka menjadi format yang lebih mudah dibaca (dalam jutaan)
            if (value >= 1000000000) {
              return (value / 1000000000).toFixed(1) + "M";
            } else if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "Jt";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            }
            return value;
          },
        },
      },
      y: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: {
            size: 11,
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(context.parsed.x);
            }
            return label;
          },
        },
      },
    },
  };

  // Options untuk grafik vertikal (untuk grafik yang tidak perlu horizontal)
  const verticalBarChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            // Format angka menjadi format yang lebih mudah dibaca (dalam jutaan)
            if (value >= 1000000000) {
              return (value / 1000000000).toFixed(1) + "M";
            } else if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "Jt";
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K";
            }
            return value;
          },
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  const features = [
    {
      icon: FaFileAlt,
      title: "Surat Perjalanan Dinas",
      description: "Kelola surat perjalanan dinas dengan mudah dan efisien",
      color: "primary",
    },
    {
      icon: FaUsers,
      title: "Manajemen Pegawai",
      description: "Sistem terintegrasi untuk pengelolaan data pegawai",
      color: "pegawai",
    },
    {
      icon: FaCar,
      title: "Kendaraan Dinas",
      description: "Monitoring dan pengelolaan kendaraan dinas",
      color: "aset",
    },
    {
      icon: FaChartLine,
      title: "Perencanaan",
      description: "Perencanaan dan penganggaran yang terstruktur",
      color: "perencanaan",
    },
    {
      icon: FaBuilding,
      title: "Unit Kerja",
      description: "Manajemen unit kerja dan struktur organisasi",
      color: "ungu",
    },
    {
      icon: FaClipboardList,
      title: "Laporan",
      description: "Laporan dan rekapitulasi data yang komprehensif",
      color: "primary",
    },
  ];

  return (
    <Layout seoProps={getSEOConfig("home")} noPaddingTop={true}>
      <Box minHeight="100vh" position="relative" overflow="hidden">
        {/* Hero Section dengan Background */}
        <Box
          height={{ base: "100vh", md: "90vh" }}
          backgroundImage={`url(${FotoDinkes})`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundAttachment="fixed"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Gradient Overlay halus dengan gelap terang */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.6) 100%)"
          />

          {/* Pattern Overlay untuk efek visual */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            opacity="0.1"
            backgroundImage="radial-gradient(circle at 2px 2px, white 1px, transparent 0)"
            backgroundSize="40px 40px"
          />

          {/* Content Hero */}
          <Container maxW="container.xl" position="relative" zIndex={2}>
            <VStack spacing={8} textAlign="center" py={20}>
              <Box css={fadeInAnimation}>
                <Text
                  color="white"
                  fontWeight={900}
                  fontSize={{ base: "2.5rem", md: "4rem", lg: "5rem" }}
                  lineHeight="1.2"
                  mb={4}
                  textShadow="2px 4px 8px rgba(0,0,0,0.3)"
                  letterSpacing="wide"
                >
                  SELAMAT DATANG DI
                </Text>
                <Text
                  color="white"
                  fontWeight={900}
                  fontSize={{ base: "3rem", md: "5rem", lg: "6rem" }}
                  lineHeight="1.2"
                  bgGradient="linear-gradient(90deg, #fff 0%, #cbfaea 100%)"
                  bgClip="text"
                  textShadow="2px 4px 8px rgba(0,0,0,0.3)"
                  letterSpacing="wide"
                >
                  PENA
                </Text>
              </Box>

              <Box css={fadeInAnimationDelay1} maxW="600px">
                <Text
                  color="white"
                  fontSize={{ base: "lg", md: "xl" }}
                  opacity={0.95}
                  lineHeight="1.8"
                  textShadow="1px 2px 4px rgba(0,0,0,0.3)"
                >
                  Sistem Informasi Terintegrasi untuk Pengelolaan Surat
                  Perjalanan Dinas, Kepegawaian, dan Administrasi Dinas
                  Kesehatan
                </Text>
              </Box>

              {!isAuthenticated && (
                <Box css={fadeInAnimationDelay2} pt={4}>
                  <HStack spacing={4} justify="center" flexWrap="wrap">
                    <Button
                      variant="primary"
                      size="lg"
                      px={8}
                      py={6}
                      fontSize="lg"
                      onClick={() => history.push("/login")}
                      _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.3s"
                    >
                      Login
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Container>

          {/* Scroll Indicator */}
          <Box
            position="absolute"
            bottom="30px"
            left="50%"
            transform="translateX(-50%)"
            zIndex={2}
            css={floatAnimation}
          >
            <Box
              width="30px"
              height="50px"
              border="2px solid white"
              borderRadius="25px"
              position="relative"
              opacity={0.8}
            >
              <Box
                width="4px"
                height="10px"
                bg="white"
                borderRadius="2px"
                position="absolute"
                top="8px"
                left="50%"
                transform="translateX(-50%)"
                css={floatAnimationFast}
              />
            </Box>
          </Box>
        </Box>

        {/* Dashboard Section - Hanya muncul jika user login */}
        {isAuthenticated && (
          <Box bg="gray.50" py={20} position="relative">
            <Container maxW="container.xl">
              <VStack spacing={8}>
                <Box textAlign="center" width="100%">
                  <Heading
                    fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                    fontWeight={800}
                    color="primary"
                    mb={4}
                  >
                    Dashboard Sub Kegiatan
                  </Heading>
                  <VStack spacing={4} align="center">
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      color="gray.600"
                      maxW="600px"
                      mx="auto"
                    >
                      Ringkasan anggaran dan realisasi sub kegiatan
                    </Text>
                    <FormControl maxW="200px">
                      <FormLabel>Tahun Anggaran</FormLabel>
                      <Select
                        value={filterTahun}
                        onChange={(e) => {
                          setFilterTahun(e.target.value);
                          setLoading(true);
                        }}
                        bg="white"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </Box>

                {loading ? (
                  <Box py={20}>
                    <Spinner size="xl" />
                  </Box>
                ) : dataSubKegiatan && dataSubKegiatan.length > 0 ? (
                  <>
                    {/* Ringkasan Statistik */}
                    <SimpleGrid
                      columns={{ base: 2, md: 4 }}
                      spacing={6}
                      width="100%"
                    >
                      <Card>
                        <CardBody>
                          <VStack align="flex-start" spacing={2}>
                            <Text fontSize="sm" color="gray.600">
                              Total Anggaran
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color="blue.600"
                            >
                              {formatRupiah(totals.totalAnggaran)}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <VStack align="flex-start" spacing={2}>
                            <Text fontSize="sm" color="gray.600">
                              Total Realisasi
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color="green.600"
                            >
                              {formatRupiah(totals.totalRealisasi)}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <VStack align="flex-start" spacing={2}>
                            <Text fontSize="sm" color="gray.600">
                              Sisa Anggaran
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color={
                                totals.totalSisa >= 0 ? "gray.600" : "red.600"
                              }
                            >
                              {formatRupiah(totals.totalSisa)}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody>
                          <VStack align="flex-start" spacing={2}>
                            <Text fontSize="sm" color="gray.600">
                              Persentase
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color="purple.600"
                            >
                              {totals.persentase}%
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Grafik Anggaran vs Realisasi per Sub Kegiatan */}
                    {anggaranRealisasiData && (
                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">
                            Perbandingan Anggaran vs Realisasi per Sub Kegiatan
                          </Heading>
                        </CardHeader>
                        <CardBody>
                          <Box height="500px">
                            <Bar
                              data={anggaranRealisasiData}
                              options={{
                                ...barChartOptions,
                                plugins: {
                                  ...barChartOptions.plugins,
                                  tooltip: {
                                    callbacks: {
                                      title: function (context) {
                                        // Tampilkan nama lengkap sub kegiatan di tooltip
                                        return context[0].label || "";
                                      },
                                      label: function (context) {
                                        let label = context.dataset.label || "";
                                        if (label) {
                                          label += ": ";
                                        }
                                        if (context.parsed.x !== null) {
                                          label += new Intl.NumberFormat(
                                            "id-ID",
                                            {
                                              style: "currency",
                                              currency: "IDR",
                                              maximumFractionDigits: 0,
                                            }
                                          ).format(context.parsed.x);
                                        }
                                        return label;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </Box>
                        </CardBody>
                      </Card>
                    )}

                    {/* Grafik Persentase Realisasi */}
                    {persentaseRealisasiData && (
                      <Card width="100%">
                        <CardHeader>
                          <Heading size="md">
                            Persentase Realisasi per Sub Kegiatan
                          </Heading>
                        </CardHeader>
                        <CardBody>
                          <Box height="500px">
                            <Bar
                              data={persentaseRealisasiData}
                              options={{
                                ...barChartOptions,
                                scales: {
                                  x: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                      callback: function (value) {
                                        return value + "%";
                                      },
                                    },
                                  },
                                  y: {
                                    ticks: {
                                      maxRotation: 0,
                                      minRotation: 0,
                                      autoSkip: false,
                                      font: {
                                        size: 11,
                                      },
                                    },
                                  },
                                },
                                plugins: {
                                  ...barChartOptions.plugins,
                                  tooltip: {
                                    callbacks: {
                                      title: function (context) {
                                        // Tampilkan nama lengkap sub kegiatan di tooltip
                                        return context[0].label || "";
                                      },
                                      label: function (context) {
                                        let label = context.dataset.label || "";
                                        if (label) {
                                          label += ": ";
                                        }
                                        if (context.parsed.x !== null) {
                                          label +=
                                            parseFloat(
                                              context.parsed.x
                                            ).toFixed(2) + "%";
                                        }
                                        return label;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </Box>
                        </CardBody>
                      </Card>
                    )}

                    {/* Grafik Dalam Daerah vs Luar Daerah */}
                    {tipePerjalananData && (
                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={6}
                        width="100%"
                      >
                        <Card>
                          <CardHeader>
                            <Heading size="md">
                              Distribusi Anggaran & Realisasi: Dalam vs Luar
                              Daerah
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            <Box height="300px">
                              <Bar
                                data={tipePerjalananData}
                                options={verticalBarChartOptions}
                              />
                            </Box>
                          </CardBody>
                        </Card>
                        <Card>
                          <CardHeader>
                            <Heading size="md">
                              Distribusi Anggaran: Dalam vs Luar Daerah
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            <Box height="300px">
                              <Pie
                                data={{
                                  labels: tipePerjalananData.labels,
                                  datasets: [
                                    {
                                      label: "Anggaran",
                                      data: [
                                        tipePerjalananData.datasets[0].data[0],
                                        tipePerjalananData.datasets[0].data[1],
                                      ],
                                      backgroundColor: [
                                        "rgba(54, 162, 235, 0.8)",
                                        "rgba(255, 99, 132, 0.8)",
                                      ],
                                      borderColor: [
                                        "rgba(54, 162, 235, 1)",
                                        "rgba(255, 99, 132, 1)",
                                      ],
                                      borderWidth: 2,
                                    },
                                  ],
                                }}
                                options={chartOptions}
                              />
                            </Box>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    )}
                  </>
                ) : (
                  <Card width="100%">
                    <CardBody>
                      <Text textAlign="center" color="gray.500">
                        Tidak ada data sub kegiatan untuk tahun {filterTahun}
                      </Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </Container>
          </Box>
        )}

        {/* Features Section */}
        <Box bg="background" py={20} position="relative">
          <Container maxW="container.xl">
            <VStack spacing={12}>
              <Box
                textAlign="center"
                css={css`
                  animation: ${fadeIn} 0.8s ease-out;
                `}
              >
                <Text
                  fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                  fontWeight={800}
                  color="primary"
                  mb={4}
                >
                  Fitur Utama
                </Text>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color="gray.600"
                  maxW="600px"
                  mx="auto"
                >
                  Sistem PENA menyediakan berbagai fitur lengkap untuk mendukung
                  operasional Dinas Kesehatan
                </Text>
              </Box>

              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={8}
                width="100%"
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    p={8}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="lg"
                    transition="all 0.3s"
                    _hover={{
                      transform: "translateY(-8px)",
                      boxShadow: "2xl",
                    }}
                    css={slideInAnimation(index)}
                    borderTop="4px solid"
                    borderColor={feature.color}
                  >
                    <VStack spacing={4} align="stretch">
                      <Icon
                        as={feature.icon}
                        w={12}
                        h={12}
                        color={feature.color}
                      />
                      <Text fontSize="xl" fontWeight={700} color="gray.800">
                        {feature.title}
                      </Text>
                      <Text fontSize="md" color="gray.600" lineHeight="1.7">
                        {feature.description}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>

        {/* Footer Section */}
      </Box>
    </Layout>
  );
}

export default Home;
