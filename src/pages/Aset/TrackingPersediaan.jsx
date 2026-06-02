import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import { Link } from "react-router-dom";
import {
  Box,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Text,
  Badge,
  Spacer,
  useColorMode,
} from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

function TrackingPersediaan() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const unitKerjaId = user[0]?.unitKerja_profile?.id;

  const fetchData = async (keyword = "") => {
    if (!unitKerjaId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/tracking-list/${unitKerjaId}`,
        { params: keyword ? { q: keyword } : {} }
      );
      setData(res.data.result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [unitKerjaId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("id-ID") : "-";

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px="30px">
        <Box
          p="30px"
          borderRadius="5px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          style={{ overflowX: "auto" }}
        >
          <HStack mb="30px" gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Tracking Persediaan
            </Text>
            <Spacer />
            <form onSubmit={handleSearch}>
              <HStack>
                <Input
                  placeholder="Cari nama barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg="terang"
                  width="280px"
                />
                <Button type="submit" variant="primary">
                  Cari
                </Button>
              </HStack>
            </form>
          </HStack>

          <Table variant="aset">
            <Thead>
              <Tr>
                <Th>Kode</Th>
                <Th>Nama Barang</Th>
                <Th>Tipe</Th>
                <Th isNumeric>Total Masuk</Th>
                <Th isNumeric>Total Keluar</Th>
                <Th isNumeric>Sisa Stok</Th>
                <Th isNumeric>Batch</Th>
                <Th>Terakhir Aktivitas</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9} textAlign="center">
                    Memuat...
                  </Td>
                </Tr>
              ) : data.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center">
                    Tidak ada data tracking
                  </Td>
                </Tr>
              ) : (
                data.map((item) => (
                  <Tr key={item.persediaanId}>
                    <Td>{item.kodeBarang || "-"}</Td>
                    <Td>{item.nama || "-"}</Td>
                    <Td>{item.tipePersediaan?.nama || "-"}</Td>
                    <Td isNumeric>{item.totalMasuk}</Td>
                    <Td isNumeric>{item.totalKeluar}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={item.sisaStok > 0 ? "green" : "red"}>
                        {item.sisaStok}
                      </Badge>
                    </Td>
                    <Td isNumeric>{item.batchCount}</Td>
                    <Td>{formatDate(item.lastActivity)}</Td>
                    <Td>
                      <Link to={`/aset/tracking-persediaan/${item.persediaanId}`}>
                        <Button size="sm" leftIcon={<BsEyeFill />} colorScheme="blue">
                          Detail
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </LayoutAset>
  );
}

export default TrackingPersediaan;
