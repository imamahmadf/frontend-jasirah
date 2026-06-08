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
  FormControl,
  FormLabel,
  useColorMode,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

const FILTER_ALL = "all";

function TrackingPersediaan() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState([]);
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);

  const fetchUnitKerja = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
      );
      setDataUnitKerja(res.data.result || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (keyword = "", unitKerjaIdParam) => {
    const id = unitKerjaIdParam ?? filterUnitKerjaId;
    if (!id) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/get/tracking-list/${id}`,
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
    fetchUnitKerja();
    const defaultUnitKerjaId = user[0]?.unitKerja_profile?.id;
    if (defaultUnitKerjaId) {
      setFilterUnitKerjaId(defaultUnitKerjaId);
    }
  }, []);

  useEffect(() => {
    if (filterUnitKerjaId) {
      fetchData(search, filterUnitKerjaId);
    }
  }, [filterUnitKerjaId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("id-ID") : "-";

  const unitKerjaFilterOptions = [
    { value: FILTER_ALL, label: "Semua Unit Kerja" },
    ...(dataUnitKerja?.map((val) => ({
      value: val.id,
      label: val.unitKerja,
    })) || []),
  ];

  const showUnitKerjaColumn = filterUnitKerjaId === FILTER_ALL;
  const colSpan = showUnitKerjaColumn ? 10 : 9;

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px="30px">
        <Box
          p="30px"
          borderRadius="5px"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          style={{ overflowX: "auto" }}
        >
          <HStack mb="30px" gap={4} align="flex-end" flexWrap="wrap">
            <Text fontSize="lg" fontWeight="bold">
              Tracking Persediaan
            </Text>
            <Spacer />
            <FormControl maxW="280px">
              <FormLabel fontSize="sm">Filter Unit Kerja</FormLabel>
              <Select2
                options={unitKerjaFilterOptions}
                placeholder="Pilih unit kerja"
                value={
                  filterUnitKerjaId
                    ? unitKerjaFilterOptions.find(
                        (opt) => opt.value === filterUnitKerjaId
                      ) || null
                    : null
                }
                onChange={(selectedOption) => {
                  setFilterUnitKerjaId(selectedOption?.value || null);
                }}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
                chakraStyles={{
                  container: (provided) => ({
                    ...provided,
                    borderRadius: "6px",
                  }),
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "terang",
                    border: "0px",
                    minHeight: "40px",
                  }),
                }}
              />
            </FormControl>
            <form onSubmit={handleSearch}>
              <HStack align="flex-end">
                <FormControl>
                  <FormLabel fontSize="sm">Cari Barang</FormLabel>
                  <Input
                    placeholder="Cari nama barang..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    bg="terang"
                    width="280px"
                  />
                </FormControl>
                <Button type="submit" variant="primary" mb="1px">
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
                {showUnitKerjaColumn && <Th>Unit Kerja</Th>}
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
                  <Td colSpan={colSpan} textAlign="center">
                    Memuat...
                  </Td>
                </Tr>
              ) : data.length === 0 ? (
                <Tr>
                  <Td colSpan={colSpan} textAlign="center">
                    Tidak ada data tracking
                  </Td>
                </Tr>
              ) : (
                data.map((item) => (
                  <Tr
                    key={
                      showUnitKerjaColumn
                        ? `${item.persediaanId}-${item.unitKerjaId}`
                        : item.persediaanId
                    }
                  >
                    <Td>{item.kodeBarang || "-"}</Td>
                    <Td>{item.nama || "-"}</Td>
                    {showUnitKerjaColumn && (
                      <Td>{item.unitKerja || "-"}</Td>
                    )}
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
                      <Link
                        to={`/aset/tracking-persediaan/${item.persediaanId}${
                          item.unitKerjaId
                            ? `?unitKerjaId=${item.unitKerjaId}`
                            : ""
                        }`}
                      >
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
