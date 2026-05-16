import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Box,
  Text,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  useToast,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import LayoutPerencanaan from "../../Componets/perencanaan/LayoutPerencanaan";
import { userRedux } from "../../Redux/Reducers/auth";
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
import { Bar, Doughnut } from "react-chartjs-2";
import { FaFileAlt, FaFolderOpen, FaTasks, FaChartLine } from "react-icons/fa";

/**
 * CATATAN PENTING: Logika Anggaran
 *
 * Di backend, pastikan logika berikut diterapkan:
 * - Total Anggaran Direncanakan BUKAN gabungan dari anggaran murni dan perubahan
 * - Jika belum ada anggaran perubahan (jenisAnggaranId === 2),
 *   maka gunakan anggaran murni (jenisAnggaranId === 1) saja
 * - Jika sudah ada anggaran perubahan, maka gunakan anggaran perubahan saja
 *   (anggaran murni TIDAK digunakan)
 * - Logika: totalAnggaranDirencanakan = anggaranPerubahan || anggaranMurni || 0
 * - Ini harus diterapkan saat menghitung:
 *   - totalAnggaranDirencanakan (BUKAN jumlah keduanya)
 *   - persentaseSerapanAnggaran
 *   - anggaranPerJenis
 */

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

function DashboardPerencanaan() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [indukUnitKerjaId, setIndukUnitKerjaId] = useState(null);
  const [dataIndukUnitKerja, setDataIndukUnitKerja] = useState([]);
  const toast = useToast();
  const user = useSelector(userRedux);

  useEffect(() => {
    fetchIndukUnitKerja();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [tahun, indukUnitKerjaId]);

  const fetchIndukUnitKerja = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/induk-unit-kerja/get`
      );
      setDataIndukUnitKerja(res.data.result || []);
    } catch (err) {
      console.error("Error fetching induk unit kerja:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (tahun) params.append("tahun", tahun);
      if (indukUnitKerjaId) params.append("indukUnitKerjaId", indukUnitKerjaId);

      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/admin-perencanaan/dashboard?${params.toString()}`
      );
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format angka dengan separator
  const formatNumber = (num) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  // Format rupiah
  const formatCurrency = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  // Data untuk chart capaian per triwulan (perbandingan Target vs Capaian)
  // Selalu tampilkan grafik meskipun semua nilai 0
  const targetPerTriwulan = dashboardData?.capaian?.targetPerTriwulan || {
    T1: 0,
    T2: 0,
    T3: 0,
    T4: 0,
  };
  const capaianPerTriwulan = dashboardData?.capaian?.capaianPerTriwulan || {
    T1: 0,
    T2: 0,
    T3: 0,
    T4: 0,
  };

  const capaianChartData = {
    labels: ["Triwulan 1", "Triwulan 2", "Triwulan 3", "Triwulan 4"],
    datasets: [
      {
        label: "Target",
        data: [
          targetPerTriwulan.T1 || 0,
          targetPerTriwulan.T2 || 0,
          targetPerTriwulan.T3 || 0,
          targetPerTriwulan.T4 || 0,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "Capaian",
        data: [
          capaianPerTriwulan.T1 || 0,
          capaianPerTriwulan.T2 || 0,
          capaianPerTriwulan.T3 || 0,
          capaianPerTriwulan.T4 || 0,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Data untuk chart anggaran per jenis
  // Tampilkan semua jenis anggaran (murni dan perubahan) untuk perbandingan
  const anggaranChartData = dashboardData?.anggaran?.anggaranPerJenis
    ? {
        labels: dashboardData.anggaran.anggaranPerJenis.map(
          (item) => item.jenis
        ),
        datasets: [
          {
            label: "Anggaran Direncanakan",
            data: dashboardData.anggaran.anggaranPerJenis.map(
              (item) => item.anggaranDirencanakan
            ),
            backgroundColor: "rgba(54, 162, 235, 0.8)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
          {
            label: "Anggaran Direalisasikan",
            data: dashboardData.anggaran.anggaranPerJenis.map(
              (item) => item.anggaranDirealisasikan
            ),
            backgroundColor: "rgba(75, 192, 192, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Hitung total anggaran direncanakan berdasarkan logika: perubahan > murni
  const totalAnggaranDirencanakan = dashboardData?.anggaran?.anggaranPerJenis
    ? (() => {
        const anggaranPerJenis = dashboardData.anggaran.anggaranPerJenis;

        // Cek apakah ada anggaran perubahan
        const anggaranPerubahan = anggaranPerJenis.find((item) =>
          item.jenis.toLowerCase().includes("perubahan")
        );

        const anggaranMurni = anggaranPerJenis.find((item) =>
          item.jenis.toLowerCase().includes("murni")
        );

        // Jika ada anggaran perubahan, gunakan perubahan. Jika tidak, gunakan murni
        return (
          anggaranPerubahan?.anggaranDirencanakan ||
          anggaranMurni?.anggaranDirencanakan ||
          0
        );
      })()
    : dashboardData?.anggaran?.totalAnggaranDirencanakan || 0;

  // Hitung persentase serapan anggaran berdasarkan totalAnggaranDirencanakan yang benar
  const totalAnggaranDirealisasikan =
    dashboardData?.anggaran?.totalAnggaranDirealisasikan || 0;
  const persentaseSerapanAnggaran =
    totalAnggaranDirencanakan > 0
      ? parseFloat(
          (
            (totalAnggaranDirealisasikan / totalAnggaranDirencanakan) *
            100
          ).toFixed(2)
        )
      : 0;

  // Data untuk doughnut chart persentase capaian
  const persentaseCapaianData = dashboardData?.capaian
    ? {
        labels: ["Capaian", "Belum Tercapai"],
        datasets: [
          {
            data: [
              dashboardData.capaian.persentaseCapaian || 0,
              100 - (dashboardData.capaian.persentaseCapaian || 0),
            ],
            backgroundColor: [
              "rgba(75, 192, 192, 0.8)",
              "rgba(201, 203, 207, 0.8)",
            ],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(201, 203, 207, 1)"],
            borderWidth: 2,
          },
        ],
      }
    : null;

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
              label += formatNumber(context.parsed.y);
            }
            return label;
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
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>
          Dashboard Perencanaan - Aplikasi Dinas Kesehatan Kabupaten Paser
        </title>
        <meta
          name="description"
          content="Dashboard perencanaan Dinas Kesehatan Kabupaten Paser"
        />
      </Helmet>

      <LayoutPerencanaan>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" mb={2}>
                Dashboard Perencanaan
              </Heading>
              <Text color="gray.600">
                Ringkasan data program, kegiatan, dan anggaran perencanaan
              </Text>
            </Box>

            {/* Filter Section */}
            <Card>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Tahun Anggaran</FormLabel>
                    <Input
                      type="number"
                      value={tahun}
                      onChange={(e) => setTahun(e.target.value)}
                      placeholder="Masukkan tahun"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Induk Unit Kerja</FormLabel>
                    <Select2
                      options={dataIndukUnitKerja.map((val) => ({
                        value: val.id,
                        label: val.indukUnitKerja,
                      }))}
                      placeholder="Pilih Induk Unit Kerja"
                      isClearable
                      onChange={(selected) =>
                        setIndukUnitKerjaId(selected?.value || null)
                      }
                      chakraStyles={{
                        container: (provided) => ({
                          ...provided,
                          borderRadius: "6px",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "white",
                          border: "1px solid",
                          borderColor: "gray.300",
                          minHeight: "40px",
                        }),
                      }}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {isLoading ? (
              <Center py={10}>
                <Spinner size="xl" />
              </Center>
            ) : dashboardData ? (
              <>
                {/* Statistik Cards */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>
                          <HStack>
                            <FaFileAlt color="#3182CE" />
                            <Text>Total Program</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatNumber(
                            dashboardData.statistik?.totalProgram || 0
                          )}
                        </StatNumber>
                        <StatHelpText>Program</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>
                          <HStack>
                            <FaFolderOpen color="#38A169" />
                            <Text>Total Kegiatan</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatNumber(
                            dashboardData.statistik?.totalKegiatan || 0
                          )}
                        </StatNumber>
                        <StatHelpText>Kegiatan</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>
                          <HStack>
                            <FaTasks color="#D69E2E" />
                            <Text>Total Sub Kegiatan</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatNumber(
                            dashboardData.statistik?.totalSubKegiatan || 0
                          )}
                        </StatNumber>
                        <StatHelpText>Sub Kegiatan</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>
                          <HStack>
                            <FaChartLine color="#E53E3E" />
                            <Text>Total Indikator</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatNumber(
                            dashboardData.statistik?.totalIndikator || 0
                          )}
                        </StatNumber>
                        <StatHelpText>Indikator</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Capaian Section */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Capaian Target</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Total Target
                            </Text>
                            <Text fontSize="xl" fontWeight="bold">
                              {formatNumber(
                                dashboardData.capaian?.totalTarget || 0
                              )}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">
                              Total Capaian
                            </Text>
                            <Text fontSize="xl" fontWeight="bold">
                              {formatNumber(
                                dashboardData.capaian?.totalCapaian || 0
                              )}
                            </Text>
                          </Box>
                        </SimpleGrid>
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.600">
                              Persentase Capaian
                            </Text>
                            <Badge
                              colorScheme={
                                dashboardData.capaian?.persentaseCapaian >= 80
                                  ? "green"
                                  : dashboardData.capaian?.persentaseCapaian >=
                                    60
                                  ? "yellow"
                                  : "red"
                              }
                              fontSize="md"
                            >
                              {dashboardData.capaian?.persentaseCapaian || 0}%
                            </Badge>
                          </HStack>
                        </Box>
                        {persentaseCapaianData && (
                          <Box height="250px">
                            <Doughnut
                              data={persentaseCapaianData}
                              options={doughnutOptions}
                            />
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="md">Capaian Per Triwulan</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <Bar data={capaianChartData} options={chartOptions} />
                      </Box>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Anggaran Section */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Anggaran</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Total Anggaran Direncanakan
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            {formatCurrency(totalAnggaranDirencanakan)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">
                            Total Anggaran Direalisasikan
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="green.600"
                          >
                            {formatCurrency(
                              dashboardData.anggaran
                                ?.totalAnggaranDirealisasikan || 0
                            )}
                          </Text>
                        </Box>
                      </SimpleGrid>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" color="gray.600">
                            Persentase Serapan Anggaran
                          </Text>
                          <Badge
                            colorScheme={
                              persentaseSerapanAnggaran >= 80
                                ? "green"
                                : persentaseSerapanAnggaran >= 60
                                ? "yellow"
                                : "red"
                            }
                            fontSize="md"
                          >
                            {persentaseSerapanAnggaran}%
                          </Badge>
                        </HStack>
                      </Box>
                      {anggaranChartData && (
                        <Box height="300px">
                          <Bar
                            data={anggaranChartData}
                            options={chartOptions}
                          />
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Statistik Per Unit Kerja */}
                {dashboardData.statistikPerUnitKerja &&
                  dashboardData.statistikPerUnitKerja.length > 0 && (
                    <Card>
                      <CardHeader>
                        <Heading size="md">Statistik Per Unit Kerja</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box overflowX="auto">
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Unit Kerja</Th>
                                <Th isNumeric>Target</Th>
                                <Th isNumeric>Capaian</Th>
                                <Th isNumeric>% Capaian</Th>
                                <Th isNumeric>Anggaran Murni</Th>
                                <Th isNumeric>Anggaran Perubahan</Th>
                                <Th isNumeric>Anggaran Direalisasikan</Th>
                                <Th isNumeric>% Serapan</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {dashboardData.statistikPerUnitKerja.map(
                                (item, index) => (
                                  <Tr key={index}>
                                    <Td>{item.unitKerja}</Td>
                                    <Td isNumeric>
                                      {formatNumber(item.totalTarget)}
                                    </Td>
                                    <Td isNumeric>
                                      {formatNumber(item.totalCapaian)}
                                    </Td>
                                    <Td isNumeric>
                                      <Badge
                                        colorScheme={
                                          item.persentaseCapaian >= 80
                                            ? "green"
                                            : item.persentaseCapaian >= 60
                                            ? "yellow"
                                            : "red"
                                        }
                                      >
                                        {item.persentaseCapaian.toFixed(2)}%
                                      </Badge>
                                    </Td>
                                    <Td isNumeric>
                                      {formatCurrency(item.anggaranMurni || 0)}
                                    </Td>
                                    <Td isNumeric>
                                      {formatCurrency(
                                        item.anggaranPerubahan || 0
                                      )}
                                    </Td>
                                    <Td isNumeric>
                                      {formatCurrency(
                                        item.anggaranDirealisasikan
                                      )}
                                    </Td>
                                    <Td isNumeric>
                                      <Badge
                                        colorScheme={
                                          item.persentaseSerapanAnggaran >= 80
                                            ? "green"
                                            : item.persentaseSerapanAnggaran >=
                                              60
                                            ? "yellow"
                                            : "red"
                                        }
                                      >
                                        {item.persentaseSerapanAnggaran.toFixed(
                                          2
                                        )}
                                        %
                                      </Badge>
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </Box>
                      </CardBody>
                    </Card>
                  )}
              </>
            ) : (
              <Center py={10}>
                <Text color="gray.500">Tidak ada data untuk ditampilkan</Text>
              </Center>
            )}
          </VStack>
        </Container>
      </LayoutPerencanaan>
    </>
  );
}

export default DashboardPerencanaan;
