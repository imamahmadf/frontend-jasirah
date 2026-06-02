import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
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
import {
  Box,
  Text,
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
  HStack,
  Flex,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Center,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaReceipt,
  FaChartLine,
  FaClock,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = [
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 99, 132, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
  "rgba(201, 203, 207, 0.8)",
];

const selectStyles = {
  container: (provided) => ({ ...provided, borderRadius: "6px" }),
  control: (provided) => ({
    ...provided,
    backgroundColor: "terang",
    border: "0px",
    height: "50px",
    minHeight: "40px",
    _hover: { borderColor: "yellow.700" },
  }),
  option: (provided, state) => ({
    ...provided,
    bg: state.isFocused ? "aset" : "white",
    color: state.isFocused ? "white" : "black",
  }),
};

function DashboardPengeluaran() {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [dashboard, setDashboard] = useState(null);
  const [dataSeed, setDataSeed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [pegawaiFilterId, setPegawaiFilterId] = useState(0);
  const [metodePembayaranFilterId, setMetodePembayaranFilterId] = useState(0);
  const [jenisPengeluaranFilterId, setJenisPengeluaranFilterId] = useState(0);
  const [statusPembayaranFilterId, setStatusPembayaranFilterId] = useState(0);

  const formatCurrency = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const formatNumber = (num) =>
    new Intl.NumberFormat("id-ID").format(num || 0);

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (tanggalAwal || tanggalAkhir) {
      if (tanggalAwal) params.append("startDate", tanggalAwal);
      if (tanggalAkhir) params.append("endDate", tanggalAkhir);
    } else if (tahun) {
      params.append("tahun", tahun);
    }
    if (unitKerjaFilterId) params.append("unitKerjaId", unitKerjaFilterId);
    if (pegawaiFilterId) params.append("pegawaiId", pegawaiFilterId);
    if (metodePembayaranFilterId)
      params.append("metodePembayaranId", metodePembayaranFilterId);
    if (jenisPengeluaranFilterId)
      params.append("jenisPengeluaranId", jenisPengeluaranFilterId);
    if (statusPembayaranFilterId)
      params.append("statusPembayaranId", statusPembayaranFilterId);
    return params;
  };

  const fetchSeed = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get/seed`
      );
      setDataSeed(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const params = buildQueryParams();
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pengeluaran/get/dashboard?${params.toString()}`
      );
      if (res.data.success) {
        setDashboard(res.data);
      } else {
        throw new Error(res.data.message || "Gagal memuat dashboard");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat data dashboard pengeluaran",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeed();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [
    tahun,
    tanggalAwal,
    tanggalAkhir,
    unitKerjaFilterId,
    pegawaiFilterId,
    metodePembayaranFilterId,
    jenisPengeluaranFilterId,
    statusPembayaranFilterId,
  ]);

  const resetFilter = () => {
    setTahun(new Date().getFullYear().toString());
    setTanggalAwal("");
    setTanggalAkhir("");
    setUnitKerjaFilterId(0);
    setPegawaiFilterId(0);
    setMetodePembayaranFilterId(0);
    setJenisPengeluaranFilterId(0);
    setStatusPembayaranFilterId(0);
  };

  const ringkasan = dashboard?.ringkasan;
  const perbandingan = dashboard?.perbandinganPeriode;
  const hutang = dashboard?.hutang;

  const makeDoughnutData = (items, labelKey = "nama") => {
    if (!items?.length) return null;
    return {
      labels: items.map((i) => i[labelKey] || "lainnya"),
      datasets: [
        {
          data: items.map((i) => i.totalNominal),
          backgroundColor: CHART_COLORS.slice(0, items.length),
          borderWidth: 2,
        },
      ],
    };
  };

  const trendChartData = dashboard?.trendBulanan?.length
    ? {
        labels: dashboard.trendBulanan.map(
          (t) => `${t.namaBulan} ${t.tahun}`
        ),
        datasets: [
          {
            label: "Total Nominal",
            data: dashboard.trendBulanan.map((t) => t.totalNominal),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const unitKerjaChartData = dashboard?.perUnitKerja?.length
    ? {
        labels: dashboard.perUnitKerja.map((u) => u.unitKerja),
        datasets: [
          {
            label: "Total Nominal",
            data: dashboard.perUnitKerja.map((u) => u.totalNominal),
            backgroundColor: CHART_COLORS,
            borderWidth: 1,
          },
        ],
      }
    : null;

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => formatCurrency(ctx.parsed.y ?? ctx.parsed),
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v) =>
            new Intl.NumberFormat("id-ID", {
              notation: "compact",
              compactDisplay: "short",
            }).format(v),
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed || 0;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  const filterLabel = dashboard?.filter
    ? dashboard.filter.startDate && dashboard.filter.endDate
      ? `${formatTanggal(dashboard.filter.startDate)} – ${formatTanggal(dashboard.filter.endDate)}`
      : dashboard.filter.tahun
        ? `Tahun ${dashboard.filter.tahun}`
        : "Periode aktif"
    : "";

  const StatCard = ({ icon, label, value, help, colorScheme = "blue" }) => (
    <Card>
      <CardBody>
        <HStack spacing={3} align="flex-start">
          <Box color={`${colorScheme}.500`} fontSize="2xl" pt={1}>
            {icon}
          </Box>
          <Stat>
            <StatLabel color="gray.500" fontSize="sm">
              {label}
            </StatLabel>
            <StatNumber fontSize="xl">{value}</StatNumber>
            {help && (
              <StatHelpText mb={0} fontSize="xs">
                {help}
              </StatHelpText>
            )}
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  );

  const HutangTable = ({ title, rows, badgeColor }) => (
    <Box>
      <HStack mb={3} justify="space-between">
        <Text fontWeight="semibold" fontSize="md">
          {title}
        </Text>
        <Badge colorScheme={badgeColor}>{rows?.length || 0}</Badge>
      </HStack>
      {rows?.length > 0 ? (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Jatuh Tempo</Th>
                <Th>Deskripsi</Th>
                <Th>Unit Kerja</Th>
                <Th isNumeric>Nominal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td whiteSpace="nowrap">{formatTanggal(r.jatuhTempo)}</Td>
                  <Td maxW="200px" isTruncated title={r.deskripsi}>
                    {r.deskripsi}
                  </Td>
                  <Td>{r.unitKerja || "-"}</Td>
                  <Td isNumeric whiteSpace="nowrap">
                    {formatCurrency(r.nominal)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Text fontSize="sm" color="gray.500">
          Tidak ada data
        </Text>
      )}
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard Pengeluaran</title>
      </Helmet>

      <LayoutAset>
        <Box bgColor="secondary" pb="40px" px="30px" pt="30px">
          <Box
            style={{ overflowX: "auto" }}
            p="30px"
            borderRadius="10px"
            bg={colorMode === "dark" ? "gray.800" : "white"}
            boxShadow="sm"
          >
            <Flex
              justify="space-between"
              align="center"
              mb="24px"
              flexWrap="wrap"
              gap={4}
            >
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="gray.700">
                  Dashboard Pengeluaran
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Ringkasan dan analisis pengeluaran
                  {filterLabel ? ` · ${filterLabel}` : ""}
                </Text>
              </VStack>
              <Button
                as={Link}
                to="/pengeluaran/daftar-pengeluaran"
                variant="outline"
                size="sm"
              >
                Lihat Daftar
              </Button>
            </Flex>

            <Divider mb="24px" />

            {/* Filter */}
            <Box mb="28px">
              <Flex justify="space-between" align="center" mb="16px">
                <Heading size="md" color="gray.700">
                  Filter
                </Heading>
                <Button size="sm" variant="ghost" onClick={resetFilter}>
                  Reset Filter
                </Button>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Tahun</FormLabel>
                  <Input
                    type="number"
                    bgColor="terang"
                    value={tahun}
                    onChange={(e) => {
                      setTahun(e.target.value);
                      setTanggalAwal("");
                      setTanggalAkhir("");
                    }}
                    isDisabled={!!tanggalAwal || !!tanggalAkhir}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Tanggal Awal</FormLabel>
                  <Input
                    type="date"
                    bgColor="terang"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Tanggal Akhir</FormLabel>
                  <Input
                    type="date"
                    bgColor="terang"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Unit Kerja</FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/search/unit-kerja?q=${inputValue}`
                        );
                        return (res.data.result || []).map((val) => ({
                          value: val.id,
                          label: val.unitKerja,
                        }));
                      } catch {
                        return [];
                      }
                    }}
                    placeholder="Cari unit kerja"
                    isClearable
                    onChange={(opt) => setUnitKerjaFilterId(opt?.value || 0)}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Pegawai</FormLabel>
                  <AsyncSelect
                    loadOptions={async (inputValue) => {
                      if (!inputValue) return [];
                      try {
                        const res = await axios.get(
                          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/pegawai/search?q=${inputValue}`
                        );
                        return (res.data.result || []).map((val) => ({
                          value: val.id,
                          label: val.nama || `Pegawai #${val.id}`,
                        }));
                      } catch {
                        return [];
                      }
                    }}
                    placeholder="Cari pegawai"
                    isClearable
                    onChange={(opt) => setPegawaiFilterId(opt?.value || 0)}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    chakraStyles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Metode Pembayaran</FormLabel>
                  <Select2
                    options={(dataSeed?.resultMetodePembayaran || []).map(
                      (v) => ({ value: v.id, label: v.nama })
                    )}
                    placeholder="Semua"
                    isClearable
                    onChange={(opt) =>
                      setMetodePembayaranFilterId(opt?.value || 0)
                    }
                    chakraStyles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Jenis Pengeluaran</FormLabel>
                  <Select2
                    options={(dataSeed?.reslutJenisPengeluaran || []).map(
                      (v) => ({ value: v.id, label: v.nama })
                    )}
                    placeholder="Semua"
                    isClearable
                    onChange={(opt) =>
                      setJenisPengeluaranFilterId(opt?.value || 0)
                    }
                    chakraStyles={selectStyles}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Status Pembayaran</FormLabel>
                  <Select2
                    options={(dataSeed?.resultStatusPembayaran || []).map(
                      (v) => ({ value: v.id, label: v.nama })
                    )}
                    placeholder="Semua"
                    isClearable
                    onChange={(opt) =>
                      setStatusPembayaranFilterId(opt?.value || 0)
                    }
                    chakraStyles={selectStyles}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {isLoading ? (
              <Center py={16}>
                <Spinner size="xl" color="blue.500" />
              </Center>
            ) : dashboard ? (
              <VStack spacing={6} align="stretch">
                {/* Ringkasan */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
                  <StatCard
                    icon={<FaReceipt />}
                    label="Total Transaksi"
                    value={formatNumber(ringkasan?.totalTransaksi)}
                    colorScheme="blue"
                  />
                  <StatCard
                    icon={<FaMoneyBillWave />}
                    label="Total Nominal"
                    value={formatCurrency(ringkasan?.totalNominal)}
                    colorScheme="green"
                  />
                  <StatCard
                    icon={<FaChartLine />}
                    label="Rata-rata"
                    value={formatCurrency(ringkasan?.rataRataNominal)}
                    colorScheme="purple"
                  />
                  <StatCard
                    icon={<FaMoneyBillWave />}
                    label="Terbesar"
                    value={formatCurrency(ringkasan?.nominalTerbesar)}
                    colorScheme="orange"
                  />
                  <StatCard
                    icon={<FaMoneyBillWave />}
                    label="Terkecil"
                    value={formatCurrency(ringkasan?.nominalTerkecil)}
                    colorScheme="gray"
                  />
                </SimpleGrid>

                {/* Perbandingan periode */}
                {perbandingan && (
                  <Card
                    bgGradient="linear(to-r, teal.500, teal.600)"
                    color="white"
                  >
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box>
                          <Text fontSize="sm" opacity={0.85}>
                            Periode Saat Ini
                          </Text>
                          <Text fontWeight="bold" fontSize="lg">
                            {formatCurrency(perbandingan.periodeSaatIni.totalNominal)}
                          </Text>
                          <Text fontSize="xs" opacity={0.8}>
                            {perbandingan.periodeSaatIni.totalTransaksi} transaksi
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" opacity={0.85}>
                            Periode Sebelumnya
                          </Text>
                          <Text fontWeight="bold" fontSize="lg">
                            {formatCurrency(
                              perbandingan.periodeSebelumnya.totalNominal
                            )}
                          </Text>
                          <Text fontSize="xs" opacity={0.8}>
                            {formatTanggal(perbandingan.periodeSebelumnya.awal)} –{" "}
                            {formatTanggal(perbandingan.periodeSebelumnya.akhir)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" opacity={0.85}>
                            Perubahan
                          </Text>
                          <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color={
                              perbandingan.selisihNominal >= 0
                                ? "red.200"
                                : "green.200"
                            }
                          >
                            {perbandingan.selisihNominal >= 0 ? "+" : ""}
                            {formatCurrency(perbandingan.selisihNominal)} (
                            {perbandingan.persentasePerubahan}%)
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {/* Hutang */}
                <Card>
                  <CardHeader pb={2}>
                    <Heading size="md">Hutang (Payable)</Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                      <Stat>
                        <StatLabel>Total Transaksi Hutang</StatLabel>
                        <StatNumber>{hutang?.totalTransaksi || 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Nominal Hutang</StatLabel>
                        <StatNumber fontSize="xl">
                          {formatCurrency(hutang?.totalNominal)}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>
                          <HStack>
                            <FaClock />
                            <span>Akan Jatuh Tempo (30 hari)</span>
                          </HStack>
                        </StatLabel>
                        <StatNumber color="orange.500">
                          {hutang?.akanJatuhTempo?.length || 0}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      <HutangTable
                        title="Akan Jatuh Tempo"
                        rows={hutang?.akanJatuhTempo}
                        badgeColor="orange"
                      />
                      <HutangTable
                        title="Sudah Jatuh Tempo"
                        rows={hutang?.sudahJatuhTempo}
                        badgeColor="red"
                      />
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Grafik */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Trend Bulanan</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="280px">
                        {trendChartData ? (
                          <Bar data={trendChartData} options={barChartOptions} />
                        ) : (
                          <Center h="full" color="gray.400">
                            Tidak ada data trend
                          </Center>
                        )}
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="sm">Per Unit Kerja</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="280px">
                        {unitKerjaChartData ? (
                          <Bar
                            data={unitKerjaChartData}
                            options={{
                              ...barChartOptions,
                              indexAxis: "y",
                            }}
                          />
                        ) : (
                          <Center h="full" color="gray.400">
                            Tidak ada data unit kerja
                          </Center>
                        )}
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="sm">Per Status Pembayaran</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="260px">
                        {makeDoughnutData(dashboard.perStatusPembayaran) ? (
                          <Doughnut
                            data={makeDoughnutData(
                              dashboard.perStatusPembayaran
                            )}
                            options={doughnutOptions}
                          />
                        ) : (
                          <Center h="full" color="gray.400">
                            Tidak ada data
                          </Center>
                        )}
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="sm">Per Jenis Pengeluaran</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="260px">
                        {makeDoughnutData(dashboard.perJenisPengeluaran) ? (
                          <Doughnut
                            data={makeDoughnutData(
                              dashboard.perJenisPengeluaran
                            )}
                            options={doughnutOptions}
                          />
                        ) : (
                          <Center h="full" color="gray.400">
                            Tidak ada data
                          </Center>
                        )}
                      </Box>
                    </CardBody>
                  </Card>

                  <Card gridColumn={{ lg: "span 2" }}>
                    <CardHeader>
                      <Heading size="sm">Per Metode Pembayaran</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="260px" maxW="480px" mx="auto">
                        {makeDoughnutData(dashboard.perMetodePembayaran) ? (
                          <Doughnut
                            data={makeDoughnutData(
                              dashboard.perMetodePembayaran
                            )}
                            options={doughnutOptions}
                          />
                        ) : (
                          <Center h="full" color="gray.400">
                            Tidak ada data
                          </Center>
                        )}
                      </Box>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Tabel ringkasan grup */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  {[
                    { title: "Per Status Pembayaran", data: dashboard.perStatusPembayaran, nameKey: "nama" },
                    { title: "Per Jenis Pengeluaran", data: dashboard.perJenisPengeluaran, nameKey: "nama" },
                  ].map(({ title, data, nameKey }) => (
                    <Card key={title}>
                      <CardHeader pb={2}>
                        <Heading size="sm">{title}</Heading>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Box overflowX="auto">
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Nama</Th>
                                <Th isNumeric>Transaksi</Th>
                                <Th isNumeric>Nominal</Th>
                                <Th isNumeric>%</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {(data || []).map((row, idx) => (
                                <Tr key={idx}>
                                  <Td>{row[nameKey]}</Td>
                                  <Td isNumeric>{row.totalTransaksi}</Td>
                                  <Td isNumeric whiteSpace="nowrap">
                                    {formatCurrency(row.totalNominal)}
                                  </Td>
                                  <Td isNumeric>{row.persentase}%</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                {/* Top & Terbaru */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                  <Card>
                    <CardHeader pb={2}>
                      <Heading size="sm">Top 10 Pengeluaran Terbesar</Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Box overflowX="auto">
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Tanggal</Th>
                              <Th>Deskripsi</Th>
                              <Th>Jenis</Th>
                              <Th isNumeric>Nominal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(dashboard.topPengeluaran || []).map((r) => (
                              <Tr key={r.id}>
                                <Td whiteSpace="nowrap">
                                  {formatTanggal(r.tanggal)}
                                </Td>
                                <Td maxW="160px" isTruncated title={r.deskripsi}>
                                  {r.deskripsi}
                                </Td>
                                <Td>{r.jenisPengeluaran || "-"}</Td>
                                <Td isNumeric whiteSpace="nowrap">
                                  {formatCurrency(r.nominal)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader pb={2}>
                      <Heading size="sm">Pengeluaran Terbaru</Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                      <Box overflowX="auto">
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Tanggal</Th>
                              <Th>Deskripsi</Th>
                              <Th>Status</Th>
                              <Th isNumeric>Nominal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {(dashboard.pengeluaranTerbaru || []).map((r) => (
                              <Tr key={r.id}>
                                <Td whiteSpace="nowrap">
                                  {formatTanggal(r.tanggal)}
                                </Td>
                                <Td maxW="160px" isTruncated title={r.deskripsi}>
                                  {r.deskripsi}
                                </Td>
                                <Td>
                                  <Badge size="sm">{r.statusPembayaran || "-"}</Badge>
                                </Td>
                                <Td isNumeric whiteSpace="nowrap">
                                  {formatCurrency(r.nominal)}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            ) : (
              <Center py={16} color="gray.500">
                Data dashboard tidak tersedia
              </Center>
            )}
          </Box>
        </Box>
      </LayoutAset>
    </>
  );
}

export default DashboardPengeluaran;
