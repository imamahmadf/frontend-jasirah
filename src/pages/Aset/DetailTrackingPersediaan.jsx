import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  useColorMode,
  Spacer,
  Image,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

function DetailTrackingPersediaan(props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const location = useLocation();
  const persediaanId = props.match.params.id;
  const queryUnitKerjaId = new URLSearchParams(location.search).get("unitKerjaId");
  const unitKerjaId =
    queryUnitKerjaId || user[0]?.unitKerja_profile?.id;

  useEffect(() => {
    if (!unitKerjaId || !persediaanId) return;
    setLoading(true);
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/tracking/${persediaanId}`,
        { params: { unitKerjaId } }
      )
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [persediaanId, unitKerjaId]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("id-ID") : "-";

  const formatRupiah = (val) =>
    `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <LayoutAset>
        <Box p="30px" textAlign="center">
          Memuat...
        </Box>
      </LayoutAset>
    );
  }

  if (!data) {
    return (
      <LayoutAset>
        <Box p="30px" textAlign="center">
          <Text mb={4}>Data tracking tidak ditemukan</Text>
          <Link to="/aset/tracking-persediaan">
            <Button variant="primary">Kembali</Button>
          </Link>
        </Box>
      </LayoutAset>
    );
  }

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px="30px">
        <Box
          p="30px"
          borderRadius="5px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          style={{ overflowX: "auto" }}
        >
          <HStack mb="30px">
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                {data.persediaan?.nama}
              </Text>
              <Text color="gray.500">
                {data.persediaan?.kodeBarang} | {data.persediaan?.tipePersediaan?.nama || "-"}
              </Text>
            </Box>
            <Spacer />
            <Link to="/aset/tracking-persediaan">
              <Button variant="outline">Kembali</Button>
            </Link>
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb="30px">
            <Stat p={4} bg="terang" borderRadius="md">
              <StatLabel>Total Masuk</StatLabel>
              <StatNumber>{data.ringkasan?.totalMasuk}</StatNumber>
            </Stat>
            <Stat p={4} bg="terang" borderRadius="md">
              <StatLabel>Total Keluar</StatLabel>
              <StatNumber>{data.ringkasan?.totalKeluar}</StatNumber>
            </Stat>
            <Stat p={4} bg="terang" borderRadius="md">
              <StatLabel>Sisa Stok</StatLabel>
              <StatNumber color={data.ringkasan?.sisaStok > 0 ? "green.500" : "red.500"}>
                {data.ringkasan?.sisaStok}
              </StatNumber>
            </Stat>
            <Stat p={4} bg="terang" borderRadius="md">
              <StatLabel>Jumlah Batch</StatLabel>
              <StatNumber>{data.ringkasan?.batchCount}</StatNumber>
            </Stat>
          </SimpleGrid>

          <Text fontWeight="bold" mb={3}>
            Riwayat Batch Masuk
          </Text>
          <Table variant="aset" mb="40px">
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th isNumeric>Masuk</Th>
                <Th isNumeric>Keluar</Th>
                <Th isNumeric>Sisa</Th>
                <Th>Harga Satuan</Th>
                <Th>Sumber Dana</Th>
                <Th>Spesifikasi</Th>
                <Th>Foto</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.batches?.map((batch) => (
                <Tr key={batch.id}>
                  <Td>{formatDate(batch.tanggal)}</Td>
                  <Td isNumeric>{batch.jumlah}</Td>
                  <Td isNumeric>{batch.totalKeluar}</Td>
                  <Td isNumeric>
                    <Badge colorScheme={batch.sisaStok > 0 ? "green" : "gray"}>
                      {batch.sisaStok}
                    </Badge>
                  </Td>
                  <Td>{formatRupiah(batch.hargaSatuan)}</Td>
                  <Td>{batch.sumberDana?.sumber || "-"}</Td>
                  <Td>{batch.spesifikasi || "-"}</Td>
                  <Td>
                    {batch.foto ? (
                      <Image
                        src={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}${batch.foto}`}
                        alt="foto"
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      "-"
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Text fontWeight="bold" mb={3}>
            Timeline Mutasi
          </Text>
          <Table variant="aset" mb="40px">
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th>Tipe</Th>
                <Th isNumeric>Jumlah</Th>
                <Th>Keterangan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.timeline?.map((item, idx) => (
                <Tr key={`${item.tipe}-${item.stokMasukId}-${idx}`}>
                  <Td>{formatDate(item.tanggal)}</Td>
                  <Td>
                    <Badge colorScheme={item.tipe === "masuk" ? "green" : "orange"}>
                      {item.tipe === "masuk" ? "Masuk" : "Keluar"}
                    </Badge>
                  </Td>
                  <Td isNumeric>{item.jumlah}</Td>
                  <Td>
                    {item.tipe === "keluar"
                      ? item.tujuan || item.keterangan || "-"
                      : item.spesifikasi || item.keterangan || "-"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Text fontWeight="bold" mb={3}>
            Riwayat Keluar
          </Text>
          <Table variant="aset">
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th isNumeric>Jumlah</Th>
                <Th>Tujuan</Th>
                <Th>Keterangan</Th>
                <Th>Periode Laporan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.riwayatKeluar?.length ? (
                data.riwayatKeluar.map((item) => (
                  <Tr key={item.id}>
                    <Td>{formatDate(item.tanggal)}</Td>
                    <Td isNumeric>{item.jumlah}</Td>
                    <Td>{item.tujuan || "-"}</Td>
                    <Td>{item.keterangan || "-"}</Td>
                    <Td>
                      {item.laporanPersediaan
                        ? `${formatDate(item.laporanPersediaan.tanggalAwal)} - ${formatDate(item.laporanPersediaan.tanggalAkhir)}`
                        : "-"}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center">
                    Belum ada pengeluaran
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </LayoutAset>
  );
}

export default DetailTrackingPersediaan;
