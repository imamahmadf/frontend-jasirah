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
} from "@chakra-ui/react";
import axios from "axios";
import LayoutPegawai from "../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
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
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { userRedux, selectRole } from "../Redux/Reducers/auth";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const STATUS_CONFIG = [
  {
    key: "PNS",
    label: "PNS",
    backgroundColor: "rgba(54, 162, 235, 0.8)",
    borderColor: "rgba(54, 162, 235, 1)",
  },
  {
    key: "CPNS",
    label: "CPNS",
    backgroundColor: "rgba(255, 99, 132, 0.8)",
    borderColor: "rgba(255, 99, 132, 1)",
  },
  {
    key: "P3K",
    label: "P3K",
    backgroundColor: "rgba(255, 206, 86, 0.8)",
    borderColor: "rgba(255, 206, 86, 1)",
  },
  {
    key: "P3KPW",
    label: "P3K Paruh Waktu",
    backgroundColor: "rgba(75, 192, 192, 0.8)",
    borderColor: "rgba(75, 192, 192, 1)",
  },
  {
    key: "PJPL",
    label: "PJLP",
    backgroundColor: "rgba(153, 102, 255, 0.8)",
    borderColor: "rgba(153, 102, 255, 1)",
  },
];

export default function DashboradPegawai() {
  const [dataPegawai, setDataPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector(userRedux);
  async function fetchDataPegawai() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/pegawai/get/unit-kerja-pegawai`,
      );
      setDataPegawai(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataPegawai();
  }, []);

  // Fungsi untuk menyiapkan data grafik berdasarkan Status
  const prepareStatusData = () => {
    if (!dataPegawai) return null;

    const statusCount = {
      PNS: 0,
      CPNS: 0,
      P3K: 0,
      PJPL: 0,
      P3KPW: 0,
    };

    dataPegawai.forEach((unit) => {
      statusCount.PNS += unit.statusPegawai?.PNS || 0;
      statusCount.CPNS += unit.statusPegawai?.CPNS || 0;
      statusCount.P3K += unit.statusPegawai?.P3K || 0;
      statusCount.PJPL += unit.statusPegawai?.PJPL || 0;
      statusCount.P3KPW += unit.statusPegawai?.p3KPW || 0;
    });

    return {
      labels: STATUS_CONFIG.map((status) => status.label),
      datasets: [
        {
          label: "Jumlah Pegawai",
          data: STATUS_CONFIG.map((status) => statusCount[status.key]),
          backgroundColor: STATUS_CONFIG.map(
            (status) => status.backgroundColor,
          ),
          borderColor: STATUS_CONFIG.map((status) => status.borderColor),
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data grafik berdasarkan Unit Kerja
  const prepareUnitKerjaData = () => {
    if (!dataPegawai) return null;

    const labels = dataPegawai.map((unit) => unit.namaUnitKerja);
    const data = dataPegawai.map((unit) => unit.totalPegawai);

    return {
      labels: labels,
      datasets: [
        {
          label: "Jumlah Pegawai per Unit Kerja",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data grafik berdasarkan Profesi
  const prepareProfesiData = () => {
    if (!dataPegawai) return null;

    const profesiCount = {};

    dataPegawai.forEach((unit) => {
      Object.values(unit.profesi || {}).forEach((profesi) => {
        const namaProfesi = profesi.namaProfesi;
        if (!profesiCount[namaProfesi]) {
          profesiCount[namaProfesi] = 0;
        }
        profesiCount[namaProfesi] +=
          (profesi.jumlah?.PNS || 0) +
          (profesi.jumlah?.CPNS || 0) +
          (profesi.jumlah?.P3K || 0) +
          (profesi.jumlah?.PJPL || 0) +
          (profesi.jumlah?.P3KPW || 0);
      });
    });

    const labels = Object.keys(profesiCount);
    const data = Object.values(profesiCount);

    // Generate colors dynamically
    const colors = labels.map(
      (_, i) => `hsla(${(i * 360) / labels.length}, 70%, 50%, 0.8)`,
    );

    return {
      labels: labels,
      datasets: [
        {
          label: "Jumlah Pegawai per Profesi",
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  // Fungsi untuk menyiapkan data grafik kombinasi Status dan Profesi
  const prepareStatusProfesiData = () => {
    if (!dataPegawai) return null;

    const profesiSet = new Set();

    // Collect all profesi names
    dataPegawai.forEach((unit) => {
      Object.values(unit.profesi || {}).forEach((profesi) => {
        profesiSet.add(profesi.namaProfesi);
      });
    });

    const profesiList = Array.from(profesiSet);
    const datasets = STATUS_CONFIG.map((status) => {
      const data = profesiList.map((profesiName) => {
        let total = 0;
        dataPegawai.forEach((unit) => {
          Object.values(unit.profesi || {}).forEach((profesi) => {
            if (profesi.namaProfesi === profesiName) {
              total += profesi.jumlah?.[status.key] || 0;
            }
          });
        });
        return total;
      });

      return {
        label: status.label,
        data: data,
        backgroundColor: status.backgroundColor,
        borderColor: status.borderColor,
        borderWidth: 2,
      };
    });

    return {
      labels: profesiList,
      datasets: datasets,
    };
  };

  const statusData = prepareStatusData();
  const unitKerjaData = prepareUnitKerjaData();
  const profesiData = prepareProfesiData();
  const statusProfesiData = prepareStatusProfesiData();

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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  if (loading) {
    return (
      <LayoutPegawai>
        <Box
          bgColor={"secondary"}
          pb={"40px"}
          px={"30px"}
          minHeight="80vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" />
        </Box>
      </LayoutPegawai>
    );
  }

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        {JSON.stringify(user[0]?.pegawaiId)}
        <Container maxW={"full"} variant={"primary"} p={"30px"}>
          <Heading size="lg" mb={6}>
            Dashboard Statistik Pegawai
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
            {/* Grafik Distribusi Status Pegawai - Pie Chart */}
            <Card>
              <CardHeader>
                <Heading size="md">
                  Distribusi Pegawai Berdasarkan Status
                </Heading>
              </CardHeader>
              <CardBody>
                <Box height="300px">
                  {statusData && (
                    <Pie data={statusData} options={chartOptions} />
                  )}
                </Box>
              </CardBody>
            </Card>

            {/* Grafik Distribusi Status Pegawai - Doughnut Chart */}
            <Card>
              <CardHeader>
                <Heading size="md">Distribusi Status Pegawai (Donat)</Heading>
              </CardHeader>
              <CardBody>
                <Box height="300px">
                  {statusData && (
                    <Doughnut data={statusData} options={chartOptions} />
                  )}
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Grafik Distribusi Pegawai berdasarkan Unit Kerja */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Distribusi Pegawai per Unit Kerja</Heading>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                {unitKerjaData && (
                  <Bar data={unitKerjaData} options={barChartOptions} />
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Grafik Distribusi Pegawai berdasarkan Profesi */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Distribusi Pegawai per Profesi</Heading>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                {profesiData && (
                  <Bar data={profesiData} options={barChartOptions} />
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Grafik Kombinasi Status dan Profesi */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Distribusi Pegawai: Status vs Profesi</Heading>
            </CardHeader>
            <CardBody>
              <Box height="500px">
                {statusProfesiData && (
                  <Bar data={statusProfesiData} options={barChartOptions} />
                )}
              </Box>
            </CardBody>
          </Card>

          {/* Ringkasan Statistik */}
          <Card>
            <CardHeader>
              <Heading size="md">Ringkasan Statistik</Heading>
            </CardHeader>
            <CardBody>
              {dataPegawai && (
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="blue.50"
                    borderLeft="4px solid"
                    borderColor="blue.500"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Total Unit Kerja
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {dataPegawai.length}
                    </Text>
                  </Box>
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="green.50"
                    borderLeft="4px solid"
                    borderColor="green.500"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Total Pegawai
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {dataPegawai.reduce(
                        (sum, unit) => sum + (unit.totalPegawai || 0),
                        0,
                      )}
                    </Text>
                  </Box>
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="purple.50"
                    borderLeft="4px solid"
                    borderColor="purple.500"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Total PNS
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                      {dataPegawai.reduce(
                        (sum, unit) => sum + (unit.statusPegawai?.PNS || 0),
                        0,
                      )}
                    </Text>
                  </Box>
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="orange.50"
                    borderLeft="4px solid"
                    borderColor="orange.500"
                  >
                    <Text fontSize="sm" color="gray.600">
                      Total Profesi
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                      {
                        new Set(
                          dataPegawai.flatMap((unit) =>
                            Object.values(unit.profesi || {}).map(
                              (p) => p.namaProfesi,
                            ),
                          ),
                        ).size
                      }
                    </Text>
                  </Box>
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}
