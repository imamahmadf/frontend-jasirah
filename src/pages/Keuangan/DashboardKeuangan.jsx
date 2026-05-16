import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Container,
  Heading,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Spinner,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Divider,
  Flex,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import { Link, useHistory } from "react-router-dom";
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
import { Bar, Doughnut, Pie } from "react-chartjs-2";

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
export default function DashboardKeuangan() {
  const [dataDashboard, setDataDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  async function fetchDashboardKeuangan() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDataDashboard(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      setDataDashboard([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardKeuangan();
  }, []);

  // Fungsi untuk mendapatkan warna badge berdasarkan statusId
  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "blue";
      case 2:
        return "green";
      case 3:
        return "yellow";
      case 4:
        return "red";
      default:
        return "gray";
    }
  };

  // Fungsi untuk mendapatkan label status berdasarkan statusId
  const getStatusLabel = (statusId) => {
    switch (statusId) {
      case 1:
        return "SPD Sudah dibuat";
      case 2:
        return "Pengajuan kwitansi";
      case 3:
        return "Kwitansi Terverivikasi";
      case 4:
        return "Kwitansi ditolak";
      default:
        return "Unknown";
    }
  };

  // Fungsi untuk memformat rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Menghitung total keseluruhan
  const calculateTotals = () => {
    if (!dataDashboard || dataDashboard.length === 0) {
      return {
        totalUnitKerja: 0,
        totalSubKegiatan: 0,
        totalPerjalanan: 0,
        totalPersonil: 0,
        totalPersonilStatus1: 0,
        totalPersonilStatus2: 0,
        totalPersonilStatus3: 0,
        totalPersonilStatus4: 0,
      };
    }

    let totalSubKegiatan = 0;
    let totalPerjalanan = 0;
    let totalPersonil = 0;
    let totalPersonilStatus1 = 0;
    let totalPersonilStatus2 = 0;
    let totalPersonilStatus3 = 0;
    let totalPersonilStatus4 = 0;

    dataDashboard.forEach((unitKerja) => {
      totalSubKegiatan += unitKerja.daftarSubKegiatans?.length || 0;
      unitKerja.daftarSubKegiatans?.forEach((subKegiatan) => {
        totalPerjalanan += subKegiatan.perjalanans?.length || 0;
      });
      totalPersonil += unitKerja.totalPersonilUnitKerja || 0;
      totalPersonilStatus1 += unitKerja.totalPersonilStatus1 || 0;
      totalPersonilStatus2 += unitKerja.totalPersonilStatus2 || 0;
      totalPersonilStatus3 += unitKerja.totalPersonilStatus3 || 0;
      totalPersonilStatus4 += unitKerja.totalPersonilStatus4 || 0;
    });

    return {
      totalUnitKerja: dataDashboard.length,
      totalSubKegiatan,
      totalPerjalanan,
      totalPersonil,
      totalPersonilStatus1,
      totalPersonilStatus2,
      totalPersonilStatus3,
      totalPersonilStatus4,
    };
  };

  const totals = calculateTotals();

  // Fungsi untuk menyiapkan data chart distribusi status personil
  const prepareStatusPersonilData = () => {
    return {
      labels: [
        "SPD Sudah dibuat",
        "Pengajuan kwitansi",
        "Kwitansi Terverivikasi",
        "Kwitansi ditolak",
      ],
      datasets: [
        {
          label: "Jumlah Personil",
          data: [
            totals.totalPersonilStatus1,
            totals.totalPersonilStatus2,
            totals.totalPersonilStatus3,
            totals.totalPersonilStatus4,
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(255, 99, 132, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data chart unit kerja berdasarkan total personil
  const prepareUnitKerjaChartData = () => {
    if (!dataDashboard || dataDashboard.length === 0) return null;

    const labels = dataDashboard.map((uk) => uk.unitKerja || "Unknown");
    const data = dataDashboard.map((uk) => uk.totalPersonilUnitKerja || 0);

    return {
      labels: labels,
      datasets: [
        {
          label: "Total Personil",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data chart unit kerja berdasarkan sub kegiatan
  const prepareSubKegiatanChartData = () => {
    if (!dataDashboard || dataDashboard.length === 0) return null;

    const labels = dataDashboard.map((uk) => uk.unitKerja || "Unknown");
    const data = dataDashboard.map((uk) => uk.daftarSubKegiatans?.length || 0);

    return {
      labels: labels,
      datasets: [
        {
          label: "Jumlah Sub Kegiatan",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data chart anggaran vs realisasi
  const prepareAnggaranRealisasiChartData = () => {
    if (!dataDashboard || dataDashboard.length === 0) return null;

    const labels = [];
    const anggaranData = [];
    const realisasiData = [];

    dataDashboard.forEach((unitKerja) => {
      if (unitKerja.daftarSubKegiatans) {
        unitKerja.daftarSubKegiatans.forEach((subKegiatan) => {
          if (subKegiatan.anggaranByTipe) {
            subKegiatan.anggaranByTipe.forEach((anggaran) => {
              const label = `${unitKerja.unitKerja} - ${subKegiatan.subKegiatan}`;
              labels.push(label);
              anggaranData.push(anggaran.anggaran || 0);
              realisasiData.push(anggaran.totalRealisasi || 0);
            });
          }
        });
      }
    });

    // Batasi jumlah data untuk menghindari chart terlalu padat
    const maxItems = 10;
    const slicedLabels = labels.slice(0, maxItems);
    const slicedAnggaran = anggaranData.slice(0, maxItems);
    const slicedRealisasi = realisasiData.slice(0, maxItems);

    return {
      labels: slicedLabels,
      datasets: [
        {
          label: "Anggaran",
          data: slicedAnggaran,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
        {
          label: "Realisasi",
          data: slicedRealisasi,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  // Options untuk chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatRupiah(context.parsed.y);
            } else if (context.parsed !== null) {
              label += context.parsed;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
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
    },
  };

  const barChartOptions = {
    ...chartOptions,
    indexAxis: "y", // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
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
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading color={"primary"} mb={2}>
                Dashboard Keuangan
              </Heading>
              <Text color="gray.600">
                Ringkasan data personil per unit kerja dan sub kegiatan
              </Text>
            </Box>

            {loading ? (
              <Box py={20} textAlign="center">
                <Spinner size="xl" />
              </Box>
            ) : dataDashboard && dataDashboard.length > 0 ? (
              <>
                {/* Statistik Total */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Total Unit Kerja
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          {totals.totalUnitKerja}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Total Sub Kegiatan
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.600"
                        >
                          {totals.totalSubKegiatan}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Total Perjalanan
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="purple.600"
                        >
                          {totals.totalPerjalanan}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Total Personil
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.600"
                        >
                          {totals.totalPersonil}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Statistik Personil berdasarkan Status */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          SPD Sudah dibuat
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          {totals.totalPersonilStatus1}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Pengajuan kwitansi
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.600"
                        >
                          {totals.totalPersonilStatus2}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Kwitansi Terverivikasi
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="yellow.600"
                        >
                          {totals.totalPersonilStatus3}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack align="flex-start" spacing={2}>
                        <Text fontSize="sm" color="gray.600">
                          Kwitansi ditolak
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="red.600">
                          {totals.totalPersonilStatus4}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Chart dan Diagram Section */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {/* Chart Distribusi Status Personil - Doughnut */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Distribusi Status Personil</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <Doughnut
                          data={prepareStatusPersonilData()}
                          options={doughnutOptions}
                        />
                      </Box>
                    </CardBody>
                  </Card>

                  {/* Chart Distribusi Status Personil - Pie */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Persentase Status Personil</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <Pie
                          data={prepareStatusPersonilData()}
                          options={doughnutOptions}
                        />
                      </Box>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Chart Unit Kerja */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {/* Chart Total Personil per Unit Kerja */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Total Personil per Unit Kerja</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="400px">
                        {prepareUnitKerjaChartData() && (
                          <Bar
                            data={prepareUnitKerjaChartData()}
                            options={barChartOptions}
                          />
                        )}
                      </Box>
                    </CardBody>
                  </Card>

                  {/* Chart Sub Kegiatan per Unit Kerja */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">
                        Jumlah Sub Kegiatan per Unit Kerja
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="400px">
                        {prepareSubKegiatanChartData() && (
                          <Bar
                            data={prepareSubKegiatanChartData()}
                            options={barChartOptions}
                          />
                        )}
                      </Box>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Chart Anggaran vs Realisasi */}
                {prepareAnggaranRealisasiChartData() &&
                  prepareAnggaranRealisasiChartData().labels.length > 0 && (
                    <Card>
                      <CardHeader>
                        <Heading size="md">
                          Perbandingan Anggaran vs Realisasi
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <Box height="500px">
                          <Bar
                            data={prepareAnggaranRealisasiChartData()}
                            options={chartOptions}
                          />
                        </Box>
                      </CardBody>
                    </Card>
                  )}

                {/* Data Unit Kerja */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Data Unit Kerja</Heading>
                  </CardHeader>
                  <CardBody>
                    <Accordion allowMultiple>
                      {dataDashboard.map((unitKerja, index) => (
                        <AccordionItem key={unitKerja.id || index}>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <VStack align="stretch" spacing={2} w="full">
                                <Flex
                                  justify="space-between"
                                  align="center"
                                  wrap="wrap"
                                  gap={2}
                                >
                                  <Text fontWeight="bold" fontSize="md">
                                    {unitKerja.unitKerja}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Text fontSize="sm" color="gray.600">
                                      Total Personil:
                                    </Text>
                                    <Badge colorScheme="orange" fontSize="sm">
                                      {unitKerja.totalPersonilUnitKerja || 0}
                                    </Badge>
                                    <Text fontSize="sm" color="gray.600">
                                      Sub Kegiatan:
                                    </Text>
                                    <Badge colorScheme="purple" fontSize="sm">
                                      {unitKerja.daftarSubKegiatans?.length ||
                                        0}
                                    </Badge>
                                  </HStack>
                                </Flex>
                                <HStack spacing={3} flexWrap="wrap">
                                  <HStack spacing={1}>
                                    <Badge
                                      colorScheme="blue"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                    >
                                      {unitKerja.totalPersonilStatus1 || 0}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600">
                                      SPD Sudah dibuat
                                    </Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Badge
                                      colorScheme="green"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                    >
                                      {unitKerja.totalPersonilStatus2 || 0}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600">
                                      Pengajuan Kwitansi
                                    </Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Badge
                                      colorScheme="yellow"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                    >
                                      {unitKerja.totalPersonilStatus3 || 0}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600">
                                      Kwitansi Terverivikasi
                                    </Text>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Badge
                                      colorScheme="red"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                    >
                                      {unitKerja.totalPersonilStatus4 || 0}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600">
                                      Kwitansi ditolak
                                    </Text>
                                  </HStack>
                                </HStack>
                              </VStack>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack spacing={4} align="stretch">
                              {/* Sub Kegiatan */}
                              {unitKerja.daftarSubKegiatans &&
                                unitKerja.daftarSubKegiatans.length > 0 && (
                                  <Box>
                                    <Heading size="sm" mb={3}>
                                      Sub Kegiatan
                                    </Heading>
                                    <Accordion allowMultiple>
                                      {unitKerja.daftarSubKegiatans.map(
                                        (subKegiatan, subIndex) => (
                                          <AccordionItem
                                            key={subKegiatan.id || subIndex}
                                            mb={2}
                                          >
                                            <AccordionButton>
                                              <Box flex="1" textAlign="left">
                                                <VStack
                                                  align="stretch"
                                                  spacing={2}
                                                  w="full"
                                                >
                                                  <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    wrap="wrap"
                                                    gap={2}
                                                  >
                                                    <VStack
                                                      align="start"
                                                      spacing={1}
                                                    >
                                                      <Text
                                                        fontWeight="semibold"
                                                        fontSize="sm"
                                                      >
                                                        {
                                                          subKegiatan.subKegiatan
                                                        }
                                                      </Text>
                                                      <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                      >
                                                        {
                                                          subKegiatan.kodeRekening
                                                        }
                                                      </Text>
                                                    </VStack>
                                                    <HStack spacing={2}>
                                                      <Badge
                                                        colorScheme="purple"
                                                        fontSize="xs"
                                                      >
                                                        {subKegiatan.perjalanans
                                                          ?.length || 0}{" "}
                                                        Perjalanan
                                                      </Badge>
                                                      <Badge
                                                        colorScheme="orange"
                                                        fontSize="xs"
                                                      >
                                                        {subKegiatan.totalPersonilSubKegiatan ||
                                                          0}{" "}
                                                        Personil
                                                      </Badge>
                                                    </HStack>
                                                  </Flex>
                                                  <HStack
                                                    spacing={2}
                                                    flexWrap="wrap"
                                                  >
                                                    <HStack spacing={1}>
                                                      <Badge
                                                        colorScheme="blue"
                                                        fontSize="xs"
                                                        px={2}
                                                        py={0.5}
                                                      >
                                                        {subKegiatan.totalPersonilStatus1 ||
                                                          0}
                                                      </Badge>
                                                      <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                      >
                                                        SPD
                                                      </Text>
                                                    </HStack>
                                                    <HStack spacing={1}>
                                                      <Badge
                                                        colorScheme="green"
                                                        fontSize="xs"
                                                        px={2}
                                                        py={0.5}
                                                      >
                                                        {subKegiatan.totalPersonilStatus2 ||
                                                          0}
                                                      </Badge>
                                                      <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                      >
                                                        Pengajuan
                                                      </Text>
                                                    </HStack>
                                                    <HStack spacing={1}>
                                                      <Badge
                                                        colorScheme="yellow"
                                                        fontSize="xs"
                                                        px={2}
                                                        py={0.5}
                                                      >
                                                        {subKegiatan.totalPersonilStatus3 ||
                                                          0}
                                                      </Badge>
                                                      <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                      >
                                                        Terverivikasi
                                                      </Text>
                                                    </HStack>
                                                    <HStack spacing={1}>
                                                      <Badge
                                                        colorScheme="red"
                                                        fontSize="xs"
                                                        px={2}
                                                        py={0.5}
                                                      >
                                                        {subKegiatan.totalPersonilStatus4 ||
                                                          0}
                                                      </Badge>
                                                      <Text
                                                        fontSize="xs"
                                                        color="gray.600"
                                                      >
                                                        Ditolak
                                                      </Text>
                                                    </HStack>
                                                  </HStack>
                                                </VStack>
                                              </Box>
                                              <AccordionIcon />
                                            </AccordionButton>
                                            <AccordionPanel pb={4}>
                                              <VStack
                                                spacing={4}
                                                align="stretch"
                                              >
                                                {/* Anggaran dan Realisasi */}
                                                {subKegiatan.anggaranByTipe &&
                                                  subKegiatan.anggaranByTipe
                                                    .length > 0 && (
                                                    <Card>
                                                      <CardHeader>
                                                        <Heading size="sm">
                                                          Anggaran dan Realisasi
                                                        </Heading>
                                                      </CardHeader>
                                                      <CardBody>
                                                        <Box overflowX="auto">
                                                          <Table
                                                            variant="simple"
                                                            size="sm"
                                                          >
                                                            <Thead>
                                                              <Tr>
                                                                <Th>Tahun</Th>
                                                                <Th>
                                                                  Tipe
                                                                  Perjalanan
                                                                </Th>
                                                                <Th>
                                                                  Anggaran
                                                                </Th>
                                                                <Th>
                                                                  Realisasi
                                                                </Th>
                                                                <Th>Sisa</Th>
                                                                <Th>
                                                                  Persentase
                                                                </Th>
                                                              </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                              {subKegiatan.anggaranByTipe.map(
                                                                (
                                                                  anggaran,
                                                                  idx
                                                                ) => {
                                                                  const sisa =
                                                                    anggaran.anggaran -
                                                                    anggaran.totalRealisasi;
                                                                  const persentase =
                                                                    anggaran.anggaran >
                                                                    0
                                                                      ? (
                                                                          (anggaran.totalRealisasi /
                                                                            anggaran.anggaran) *
                                                                          100
                                                                        ).toFixed(
                                                                          2
                                                                        )
                                                                      : 0;
                                                                  return (
                                                                    <Tr
                                                                      key={idx}
                                                                    >
                                                                      <Td>
                                                                        {
                                                                          anggaran.tahun
                                                                        }
                                                                      </Td>
                                                                      <Td>
                                                                        <Badge colorScheme="blue">
                                                                          {anggaran.tipePerjalanan ||
                                                                            "-"}
                                                                        </Badge>
                                                                      </Td>
                                                                      <Td>
                                                                        <Text fontWeight="semibold">
                                                                          {formatRupiah(
                                                                            anggaran.anggaran
                                                                          )}
                                                                        </Text>
                                                                      </Td>
                                                                      <Td>
                                                                        <Text
                                                                          fontWeight="semibold"
                                                                          color="green.600"
                                                                        >
                                                                          {formatRupiah(
                                                                            anggaran.totalRealisasi
                                                                          )}
                                                                        </Text>
                                                                      </Td>
                                                                      <Td>
                                                                        <Text
                                                                          fontWeight="semibold"
                                                                          color={
                                                                            sisa >=
                                                                            0
                                                                              ? "gray.600"
                                                                              : "red.600"
                                                                          }
                                                                        >
                                                                          {formatRupiah(
                                                                            sisa
                                                                          )}
                                                                        </Text>
                                                                      </Td>
                                                                      <Td>
                                                                        <Badge
                                                                          colorScheme={
                                                                            parseFloat(
                                                                              persentase
                                                                            ) <=
                                                                            100
                                                                              ? "green"
                                                                              : "red"
                                                                          }
                                                                        >
                                                                          {
                                                                            persentase
                                                                          }
                                                                          %
                                                                        </Badge>
                                                                      </Td>
                                                                    </Tr>
                                                                  );
                                                                }
                                                              )}
                                                            </Tbody>
                                                          </Table>
                                                        </Box>
                                                      </CardBody>
                                                    </Card>
                                                  )}

                                                <Divider />

                                                {/* Detail Perjalanan */}
                                                {subKegiatan.perjalanans &&
                                                  subKegiatan.perjalanans
                                                    .length > 0 && (
                                                    <Box>
                                                      <Heading size="sm" mb={4}>
                                                        Detail Perjalanan
                                                      </Heading>
                                                      <SimpleGrid
                                                        columns={{
                                                          base: 1,
                                                          md: 2,
                                                        }}
                                                        spacing={4}
                                                      >
                                                        {subKegiatan.perjalanans.map(
                                                          (
                                                            perjalanan,
                                                            perjalananIndex
                                                          ) => {
                                                            // Mengambil tempat tujuan dari perjalanan.tempats
                                                            const tempatTujuan =
                                                              perjalanan.tempats
                                                                ?.map(
                                                                  (t) =>
                                                                    t.tempat
                                                                )
                                                                .filter(
                                                                  (t) => t
                                                                ) || [];

                                                            return (
                                                              <Card
                                                                key={
                                                                  perjalanan.id ||
                                                                  perjalananIndex
                                                                }
                                                                variant="outline"
                                                              >
                                                                <CardBody>
                                                                  <VStack
                                                                    align="stretch"
                                                                    spacing={3}
                                                                  >
                                                                    <Flex
                                                                      justify="space-between"
                                                                      align="start"
                                                                    >
                                                                      <VStack
                                                                        align="start"
                                                                        spacing={
                                                                          1
                                                                        }
                                                                      >
                                                                        <Text
                                                                          fontSize="sm"
                                                                          color="gray.600"
                                                                        >
                                                                          Tempat
                                                                          Tujuan
                                                                        </Text>
                                                                        {tempatTujuan.length >
                                                                        0 ? (
                                                                          <HStack
                                                                            spacing={
                                                                              1
                                                                            }
                                                                            flexWrap="wrap"
                                                                          >
                                                                            {tempatTujuan.map(
                                                                              (
                                                                                tempat,
                                                                                idx
                                                                              ) => (
                                                                                <Badge
                                                                                  key={
                                                                                    idx
                                                                                  }
                                                                                  colorScheme="teal"
                                                                                  fontSize="xs"
                                                                                >
                                                                                  {
                                                                                    tempat
                                                                                  }
                                                                                </Badge>
                                                                              )
                                                                            )}
                                                                          </HStack>
                                                                        ) : (
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.400"
                                                                          >
                                                                            -
                                                                          </Text>
                                                                        )}
                                                                      </VStack>
                                                                      <Button
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        onClick={() =>
                                                                          history.push(
                                                                            `/admin/rampung/${
                                                                              perjalanan.id ||
                                                                              ""
                                                                            }`
                                                                          )
                                                                        }
                                                                      >
                                                                        Lihat
                                                                        Detail
                                                                      </Button>
                                                                    </Flex>

                                                                    <Divider />

                                                                    <Box>
                                                                      <Text
                                                                        fontSize="sm"
                                                                        color="gray.600"
                                                                        mb={2}
                                                                      >
                                                                        Status
                                                                        Personil
                                                                      </Text>
                                                                      <SimpleGrid
                                                                        columns={
                                                                          2
                                                                        }
                                                                        spacing={
                                                                          3
                                                                        }
                                                                      >
                                                                        <HStack justify="space-between">
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.600"
                                                                          >
                                                                            Total
                                                                            Personil
                                                                          </Text>
                                                                          <Badge colorScheme="blue">
                                                                            {
                                                                              perjalanan.totalPersonilPerjalanan
                                                                            }
                                                                          </Badge>
                                                                        </HStack>
                                                                        <HStack justify="space-between">
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.600"
                                                                          >
                                                                            SPD
                                                                            Sudah
                                                                            dibuat
                                                                          </Text>
                                                                          <Badge colorScheme="blue">
                                                                            {
                                                                              perjalanan.totalPersonilStatus1
                                                                            }
                                                                          </Badge>
                                                                        </HStack>
                                                                        <HStack justify="space-between">
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.600"
                                                                          >
                                                                            Pengajuan
                                                                            kwitansi
                                                                          </Text>
                                                                          <Badge colorScheme="green">
                                                                            {
                                                                              perjalanan.totalPersonilStatus2
                                                                            }
                                                                          </Badge>
                                                                        </HStack>
                                                                        <HStack justify="space-between">
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.600"
                                                                          >
                                                                            Kwitansi
                                                                            Terverivikasi
                                                                          </Text>
                                                                          <Badge colorScheme="yellow">
                                                                            {
                                                                              perjalanan.totalPersonilStatus3
                                                                            }
                                                                          </Badge>
                                                                        </HStack>
                                                                        <HStack justify="space-between">
                                                                          <Text
                                                                            fontSize="sm"
                                                                            color="gray.600"
                                                                          >
                                                                            Kwitansi
                                                                            ditolak
                                                                          </Text>
                                                                          <Badge colorScheme="red">
                                                                            {
                                                                              perjalanan.totalPersonilStatus4
                                                                            }
                                                                          </Badge>
                                                                        </HStack>
                                                                      </SimpleGrid>
                                                                    </Box>
                                                                  </VStack>
                                                                </CardBody>
                                                              </Card>
                                                            );
                                                          }
                                                        )}
                                                      </SimpleGrid>
                                                    </Box>
                                                  )}
                                              </VStack>
                                            </AccordionPanel>
                                          </AccordionItem>
                                        )
                                      )}
                                    </Accordion>
                                  </Box>
                                )}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Card>
                <CardBody>
                  <Text textAlign="center" color="gray.500">
                    Tidak ada data untuk ditampilkan
                  </Text>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
}
