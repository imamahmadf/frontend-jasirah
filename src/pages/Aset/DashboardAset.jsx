import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import {
  Box,
  Text,
  Container,
  FormControl,
  FormLabel,
  Center,
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
  useToast,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import LayoutAset from "../../Componets/Aset/LayoutAset";
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
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  FaBox,
  FaCar,
  FaBuilding,
  FaWarehouse,
  FaFileInvoiceDollar,
  FaChartBar,
  FaMoneyBillWave,
  FaHandshake,
} from "react-icons/fa";

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

function DashboardAset() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [indukUnitKerjaId, setIndukUnitKerjaId] = useState(null);
  const [dataIndukUnitKerja, setDataIndukUnitKerja] = useState([]);
  const toast = useToast();
  const user = useSelector(userRedux);

  useEffect(() => {
    fetchIndukUnitKerja();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [indukUnitKerjaId]);

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
      if (indukUnitKerjaId) {
        params.append("indukUnitKerjaId", indukUnitKerjaId);
      }

      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/barjas/get/dashboard?${params.toString()}`
      );

      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        throw new Error(res.data.message || "Gagal memuat data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat data dashboard",
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

  // Data untuk pie chart distribusi jumlah aset berdasarkan kategori
  const jumlahAsetChartData = dashboardData
    ? {
        labels: [
          "Kendaraan",
          "Bangunan",
          "Barjas Barang",
          "Barjas Jasa",
          "Persediaan",
        ],
        datasets: [
          {
            label: "Jumlah Aset",
            data: [
              dashboardData.belanjaModal?.kendaraan?.total || 0,
              dashboardData.belanjaModal?.bangunan?.total || 0,
              dashboardData.belanjaModal?.barjasBarang?.total || 0,
              dashboardData.belanjaJasa?.barjasJasa?.total || 0,
              dashboardData.persediaan?.total || 0,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Data untuk bar chart perbandingan nilai aset berdasarkan kategori belanja
  const nilaiAsetChartData = dashboardData
    ? {
        labels: ["Belanja Modal", "Belanja Jasa", "Persediaan"],
        datasets: [
          {
            label: "Total Nilai (Rupiah)",
            data: [
              dashboardData.belanjaModal?.totalNilai || 0,
              dashboardData.belanjaJasa?.totalNilai || 0,
              dashboardData.persediaan?.totalNilai || 0,
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Data untuk doughnut chart distribusi nilai aset berdasarkan kategori belanja
  const distribusiNilaiChartData = dashboardData
    ? {
        labels: ["Belanja Modal", "Belanja Jasa", "Persediaan"],
        datasets: [
          {
            data: [
              dashboardData.belanjaModal?.totalNilai || 0,
              dashboardData.belanjaJasa?.totalNilai || 0,
              dashboardData.persediaan?.totalNilai || 0,
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.8)",
              "rgba(153, 102, 255, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(75, 192, 192, 1)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Data untuk bar chart detail belanja modal
  const belanjaModalDetailChartData = dashboardData
    ? {
        labels: ["Kendaraan", "Bangunan", "Barjas Barang"],
        datasets: [
          {
            label: "Total Nilai (Rupiah)",
            data: [
              dashboardData.belanjaModal?.kendaraan?.totalNilai || 0,
              dashboardData.belanjaModal?.bangunan?.totalNilai || 0,
              dashboardData.belanjaModal?.barjasBarang?.totalNilai || 0,
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(54, 162, 235, 0.8)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(54, 162, 235, 1)",
            ],
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
              label += formatCurrency(context.parsed.y);
            } else if (context.parsed !== null) {
              label += formatCurrency(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };

  const pieChartOptions = {
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
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatNumber(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Aset - Aplikasi Dinas Kesehatan Kabupaten Paser</title>
        <meta
          name="description"
          content="Dashboard aset Dinas Kesehatan Kabupaten Paser"
        />
      </Helmet>

      <LayoutAset>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Box>
              <Heading size="lg" mb={2}>
                Dashboard Aset
              </Heading>
              <Text color="gray.600">
                Ringkasan data aset meliputi Barjas, Kendaraan, Bangunan, dan
                Persediaan
              </Text>
            </Box>

            {/* Filter Section */}
            <Card>
              <CardBody>
                <FormControl>
                  <FormLabel>Filter Induk Unit Kerja</FormLabel>
                  <Select2
                    options={dataIndukUnitKerja.map((val) => ({
                      value: val.id,
                      label: val.indukUnitKerja,
                    }))}
                    placeholder="Pilih Induk Unit Kerja (Opsional)"
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
              </CardBody>
            </Card>

            {isLoading ? (
              <Center py={10}>
                <Spinner size="xl" />
              </Center>
            ) : dashboardData ? (
              <>
                {/* Statistik Cards - Total */}
                <Card
                  bgGradient="linear(to-r, blue.500, blue.600)"
                  color="white"
                >
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Stat>
                        <StatLabel color="blue.100">Total Aset</StatLabel>
                        <StatNumber fontSize="3xl">
                          {formatNumber(dashboardData.total?.totalAset || 0)}
                        </StatNumber>
                        <StatHelpText color="blue.100">
                          Unit aset keseluruhan
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel color="blue.100">Total Nilai Aset</StatLabel>
                        <StatNumber fontSize="3xl">
                          {formatCurrency(dashboardData.total?.totalNilai || 0)}
                        </StatNumber>
                        <StatHelpText color="blue.100">
                          Nilai total semua aset
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Statistik Cards - Per Kategori Belanja */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                  <Card
                    bgGradient="linear(to-r, blue.400, blue.500)"
                    color="white"
                  >
                    <CardBody>
                      <Stat>
                        <StatLabel color="blue.100">
                          <HStack>
                            <FaMoneyBillWave />
                            <Text>Belanja Modal</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatCurrency(
                            dashboardData.belanjaModal?.totalNilai || 0
                          )}
                        </StatNumber>
                        <StatHelpText color="blue.100">
                          Kendaraan:{" "}
                          {formatNumber(
                            dashboardData.belanjaModal?.kendaraan?.total || 0
                          )}{" "}
                          | Bangunan:{" "}
                          {formatNumber(
                            dashboardData.belanjaModal?.bangunan?.total || 0
                          )}{" "}
                          | Barjas:{" "}
                          {formatNumber(
                            dashboardData.belanjaModal?.barjasBarang?.total || 0
                          )}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card
                    bgGradient="linear(to-r, purple.400, purple.500)"
                    color="white"
                  >
                    <CardBody>
                      <Stat>
                        <StatLabel color="purple.100">
                          <HStack>
                            <FaHandshake />
                            <Text>Belanja Jasa</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatCurrency(
                            dashboardData.belanjaJasa?.totalNilai || 0
                          )}
                        </StatNumber>
                        <StatHelpText color="purple.100">
                          Barjas Jasa:{" "}
                          {formatNumber(
                            dashboardData.belanjaJasa?.barjasJasa?.total || 0
                          )}{" "}
                          item
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card
                    bgGradient="linear(to-r, green.400, green.500)"
                    color="white"
                  >
                    <CardBody>
                      <Stat>
                        <StatLabel color="green.100">
                          <HStack>
                            <FaWarehouse />
                            <Text>Persediaan</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="2xl">
                          {formatCurrency(
                            dashboardData.persediaan?.totalNilai || 0
                          )}
                        </StatNumber>
                        <StatHelpText color="green.100">
                          Total:{" "}
                          {formatNumber(dashboardData.persediaan?.total || 0)} |
                          Stok Masuk:{" "}
                          {formatNumber(
                            dashboardData.persediaan?.totalStokMasuk || 0
                          )}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Ringkasan Barjas */}
                <Card>
                  <CardHeader>
                    <Heading size="md">
                      Ringkasan Barjas (Barang & Jasa)
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Total SP
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {formatNumber(
                            dashboardData.ringkasanBarjas?.totalSP || 0
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Total Barjas
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {formatNumber(
                            dashboardData.ringkasanBarjas?.totalBarjas || 0
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Barjas Barang
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600">
                          {formatNumber(
                            dashboardData.ringkasanBarjas?.totalBarjasBarang ||
                              0
                          )}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Nilai:{" "}
                          {formatCurrency(
                            dashboardData.ringkasanBarjas?.totalNilaiBarang || 0
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">
                          Barjas Jasa
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color="purple.600"
                        >
                          {formatNumber(
                            dashboardData.ringkasanBarjas?.totalBarjasJasa || 0
                          )}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Nilai:{" "}
                          {formatCurrency(
                            dashboardData.ringkasanBarjas?.totalNilaiJasa || 0
                          )}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Grafik Section */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {/* Pie Chart - Distribusi Jumlah Aset */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Distribusi Jumlah Aset</Heading>
                    </CardHeader>
                    <CardBody>
                      {jumlahAsetChartData ? (
                        <Box height="300px">
                          <Pie
                            data={jumlahAsetChartData}
                            options={pieChartOptions}
                          />
                        </Box>
                      ) : (
                        <Center height="300px">
                          <Text color="gray.500">Tidak ada data</Text>
                        </Center>
                      )}
                    </CardBody>
                  </Card>

                  {/* Doughnut Chart - Distribusi Nilai Aset */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Distribusi Nilai Aset</Heading>
                    </CardHeader>
                    <CardBody>
                      {distribusiNilaiChartData ? (
                        <Box height="300px">
                          <Doughnut
                            data={distribusiNilaiChartData}
                            options={pieChartOptions}
                          />
                        </Box>
                      ) : (
                        <Center height="300px">
                          <Text color="gray.500">Tidak ada data</Text>
                        </Center>
                      )}
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Bar Chart - Perbandingan Nilai Aset per Kategori Belanja */}
                <Card>
                  <CardHeader>
                    <Heading size="md">
                      Perbandingan Nilai Aset per Kategori Belanja
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    {nilaiAsetChartData ? (
                      <Box height="300px">
                        <Bar data={nilaiAsetChartData} options={chartOptions} />
                      </Box>
                    ) : (
                      <Center height="300px">
                        <Text color="gray.500">Tidak ada data</Text>
                      </Center>
                    )}
                  </CardBody>
                </Card>

                {/* Bar Chart - Detail Belanja Modal */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Detail Belanja Modal</Heading>
                  </CardHeader>
                  <CardBody>
                    {belanjaModalDetailChartData ? (
                      <Box height="300px">
                        <Bar
                          data={belanjaModalDetailChartData}
                          options={chartOptions}
                        />
                      </Box>
                    ) : (
                      <Center height="300px">
                        <Text color="gray.500">Tidak ada data</Text>
                      </Center>
                    )}
                  </CardBody>
                </Card>

                {/* Tabel Ringkasan */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Ringkasan Aset per Kategori</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Kategori</Th>
                            <Th>Jenis</Th>
                            <Th isNumeric>Jumlah</Th>
                            <Th isNumeric>Total Nilai</Th>
                            <Th>Keterangan</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {/* Belanja Modal - Kendaraan */}
                          <Tr>
                            <Td>
                              <HStack>
                                <FaMoneyBillWave color="#3182CE" />
                                <Text fontWeight="bold">Belanja Modal</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack>
                                <FaCar color="#E53E3E" />
                                <Text>Kendaraan</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.belanjaModal?.kendaraan?.total ||
                                  0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaModal?.kendaraan
                                  ?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Unit kendaraan dinas</Text>
                            </Td>
                          </Tr>
                          {/* Belanja Modal - Bangunan */}
                          <Tr>
                            <Td>
                              <Text fontSize="sm" color="gray.500">
                                └─
                              </Text>
                            </Td>
                            <Td>
                              <HStack>
                                <FaBuilding color="#D69E2E" />
                                <Text>Bangunan</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.belanjaModal?.bangunan?.total || 0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaModal?.bangunan
                                  ?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Unit bangunan</Text>
                            </Td>
                          </Tr>
                          {/* Belanja Modal - Barjas Barang */}
                          <Tr>
                            <Td>
                              <Text fontSize="sm" color="gray.500">
                                └─
                              </Text>
                            </Td>
                            <Td>
                              <HStack>
                                <FaBox color="#3182CE" />
                                <Text>Barjas Barang</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.belanjaModal?.barjasBarang
                                  ?.total || 0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaModal?.barjasBarang
                                  ?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                Item barjas jenis barang
                              </Text>
                            </Td>
                          </Tr>
                          {/* Subtotal Belanja Modal */}
                          <Tr bg="blue.50" fontWeight="semibold">
                            <Td>
                              <Text>Subtotal Belanja Modal</Text>
                            </Td>
                            <Td>
                              <Text>-</Text>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                (dashboardData.belanjaModal?.kendaraan?.total ||
                                  0) +
                                  (dashboardData.belanjaModal?.bangunan
                                    ?.total || 0) +
                                  (dashboardData.belanjaModal?.barjasBarang
                                    ?.total || 0)
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaModal?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Total belanja modal</Text>
                            </Td>
                          </Tr>
                          {/* Belanja Jasa - Barjas Jasa */}
                          <Tr>
                            <Td>
                              <HStack>
                                <FaHandshake color="#805AD5" />
                                <Text fontWeight="bold">Belanja Jasa</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack>
                                <FaBox color="#805AD5" />
                                <Text>Barjas Jasa</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.belanjaJasa?.barjasJasa?.total ||
                                  0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaJasa?.barjasJasa
                                  ?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Item barjas jenis jasa</Text>
                            </Td>
                          </Tr>
                          {/* Subtotal Belanja Jasa */}
                          <Tr bg="purple.50" fontWeight="semibold">
                            <Td>
                              <Text>Subtotal Belanja Jasa</Text>
                            </Td>
                            <Td>
                              <Text>-</Text>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.belanjaJasa?.barjasJasa?.total ||
                                  0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.belanjaJasa?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Total belanja jasa</Text>
                            </Td>
                          </Tr>
                          {/* Persediaan */}
                          <Tr>
                            <Td>
                              <HStack>
                                <FaWarehouse color="#38A169" />
                                <Text fontWeight="bold">Persediaan</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text>Persediaan</Text>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.persediaan?.total || 0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.persediaan?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm">
                                  Stok Masuk:{" "}
                                  {formatNumber(
                                    dashboardData.persediaan?.totalStokMasuk ||
                                      0
                                  )}
                                </Text>
                              </VStack>
                            </Td>
                          </Tr>
                          {/* Total Keseluruhan */}
                          <Tr bg="blue.100" fontWeight="bold">
                            <Td>
                              <HStack>
                                <FaChartBar color="#2B6CB0" />
                                <Text>TOTAL KESELURUHAN</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Text>-</Text>
                            </Td>
                            <Td isNumeric>
                              {formatNumber(
                                dashboardData.total?.totalAset || 0
                              )}
                            </Td>
                            <Td isNumeric>
                              {formatCurrency(
                                dashboardData.total?.totalNilai || 0
                              )}
                            </Td>
                            <Td>
                              <Text fontSize="sm">Total semua aset</Text>
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Center py={10}>
                <Text color="gray.500">Tidak ada data untuk ditampilkan</Text>
              </Center>
            )}
          </VStack>
        </Container>
      </LayoutAset>
    </>
  );
}

export default DashboardAset;
