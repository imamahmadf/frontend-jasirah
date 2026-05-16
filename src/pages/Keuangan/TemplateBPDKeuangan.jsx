import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Container,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Text,
  useToast,
  useColorMode,
  Collapse,
  IconButton,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Button,
} from "@chakra-ui/react";
import { BsChevronDown, BsChevronUp, BsPencil } from "react-icons/bs";
import axios from "axios";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";
import Layout from "../../Componets/Layout";
import Loading from "../../Componets/Loading";
import DataKosong from "../../Componets/DataKosong";
import ReactPaginate from "react-paginate";
import "../../Style/pagination.css";
import { AsyncSelect } from "chakra-react-select";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/id";

function templateBPDKeuangan() {
  const [dataTemplateBPD, setDataTemplateBPD] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const { colorMode } = useColorMode();
  const toast = useToast();
  const user = useSelector(userRedux);

  // State untuk pagination
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  // State untuk filtering
  const [filterStatus, setFilterStatus] = useState("");
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(null);

  // State untuk update status
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Format rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Toggle expand row untuk menampilkan templateRill
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch data templateBPD dengan pagination dan filtering
  async function fetchTemplateBPD() {
    if (!user?.[0]?.unitKerja_profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      
      // Jika ada filter unitKerja, gunakan filter tersebut, jika tidak gunakan unitKerja user
      if (unitKerjaFilterId) {
        params.append("unitKerjaId", unitKerjaFilterId.toString());
      } else {
        params.append("unitKerjaId", user[0].unitKerja_profile.id.toString());
      }
      
      if (filterStatus && ["aktif", "nonaktif"].includes(filterStatus)) {
        params.append("status", filterStatus);
      }

      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/get/all?${params.toString()}`
      );
      
      setDataTemplateBPD(res.data.result || []);
      setTotalRows(res.data.totalRows || 0);
      setTotalPage(res.data.totalPage || 0);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data template BPD",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle change page
  const changePage = ({ selected }) => {
    setPage(selected);
  };

  // Handle filter status change
  const handleFilterStatusChange = (value) => {
    setFilterStatus(value);
    setPage(0); // Reset ke halaman pertama saat filter berubah
  };

  // Update status template BPD
  const updateStatus = async (templateId, newStatus) => {
    setUpdatingStatusId(templateId);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/templateBPD/update-status/${templateId}`,
        { status: newStatus }
      );

      // Update local state
      setDataTemplateBPD((prev) =>
        prev.map((template) =>
          template.id === templateId
            ? { ...template, status: newStatus }
            : template
        )
      );

      toast({
        title: "Berhasil",
        description: `Status berhasil diubah menjadi ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal mengubah status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setPage(0);
  }, [unitKerjaFilterId, filterStatus]);

  useEffect(() => {
    if (user?.[0]?.unitKerja_profile?.id) {
      fetchTemplateBPD();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, limit, filterStatus, unitKerjaFilterId]);

  if (isLoading) {
    return (
      <Layout>
        <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
          <Container
            maxWidth={"1280px"}
            style={{ overflowX: "auto" }}
            p={"30px"}
            variant={"primary"}
          >
            <Loading />
          </Container>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container
          maxWidth={"1280px"}
          style={{ overflowX: "auto" }}
          p={"30px"}
          variant={"primary"}
        >
          <Flex justify="space-between" align="center" mb={"30px"}>
            <HStack>
              <Box
                bgColor="primary"
                width="30px"
                height="30px"
                borderRadius="4px"
              />
              <Heading color="primary" fontSize="28px" fontWeight="600">
                Template BPD
              </Heading>
            </HStack>
          </Flex>

          {/* Filter Section */}
          <Box mb={"20px"}>
            <Flex mb={"15px"} gap={4} align="center" wrap="wrap">
              <FormControl width={{ base: "100%", md: "300px" }}>
                <FormLabel>Pencarian Unit Kerja</FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${
                          import.meta.env.VITE_REACT_APP_API_BASE_URL
                        }/admin/search/unit-kerja?q=${inputValue}`
                      );

                      const filtered = res.data.result;

                      return filtered.map((val) => ({
                        value: val.id,
                        label: val.unitKerja,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik Nama Unit Kerja"
                  onChange={(selectedOption) => {
                    setUnitKerjaFilterId(selectedOption?.value || null);
                  }}
                  isClearable
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
                      backgroundColor: colorMode === "dark" ? "gray.700" : "white",
                      border: "1px solid",
                      borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused
                        ? colorMode === "dark"
                          ? "gray.600"
                          : "gray.100"
                        : "transparent",
                      color: state.isFocused
                        ? colorMode === "dark"
                          ? "white"
                          : "black"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl width={{ base: "100%", md: "200px" }}>
                <FormLabel>Filter Status</FormLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => handleFilterStatusChange(e.target.value)}
                  placeholder="Semua Status"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </Select>
              </FormControl>
              <FormControl width={{ base: "100%", md: "150px" }}>
                <FormLabel>Items per Page</FormLabel>
                <Select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setPage(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Select>
              </FormControl>
              <Box mt={{ base: 0, md: "32px" }}>
                <Text fontSize="sm" color="gray.500">
                  Total: {totalRows} data
                </Text>
              </Box>
            </Flex>
            {(unitKerjaFilterId || filterStatus) && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => {
                  setUnitKerjaFilterId(null);
                  setFilterStatus("");
                }}
              >
                Reset Filter
              </Button>
            )}
          </Box>

          {dataTemplateBPD.length === 0 ? (
            <DataKosong />
          ) : (
            <Table variant="primary">
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Nama Kota</Th>
                  <Th>Uang Harian</Th>
                  <Th>Unit Kerja</Th>
                  <Th>Status</Th>
                  <Th>Template Rill</Th>
                  <Th>Detail</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataTemplateBPD.map((template, index) => (
                  <React.Fragment key={template.id}>
                    <Tr>
                      <Td>{index + 1}</Td>
                      <Td fontWeight="medium">{template.namaKota || "-"}</Td>
                      <Td>{formatRupiah(template.uangHarian)}</Td>
                      <Td>
                        <Text fontSize="sm">
                          {template.daftarUnitKerja?.unitKerja || "-"}
                        </Text>
                        {template.daftarUnitKerja?.kode && (
                          <Text fontSize="xs" color="gray.500">
                            Kode: {template.daftarUnitKerja.kode}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            template.status === "aktif" ? "green" : "red"
                          }
                        >
                          {template.status || "-"}
                        </Badge>
                      </Td>
                      <Td>
                        {(template.templateRills || template.templateRill) &&
                        (template.templateRills || template.templateRill).length > 0 ? (
                          <Text>
                            {(template.templateRills || template.templateRill).length} item
                          </Text>
                        ) : (
                          <Text color="gray.500">Tidak ada</Text>
                        )}
                      </Td>
                      <Td>
                        {(template.templateRills || template.templateRill) &&
                        (template.templateRills || template.templateRill).length > 0 && (
                          <IconButton
                            icon={
                              expandedRows[template.id] ? (
                                <BsChevronUp />
                              ) : (
                                <BsChevronDown />
                              )
                            }
                            onClick={() => toggleRow(template.id)}
                            size="sm"
                            variant="ghost"
                            aria-label="Toggle details"
                          />
                        )}
                      </Td>
                    </Tr>
                    {expandedRows[template.id] &&
                      (template.templateRills || template.templateRill) &&
                      (template.templateRills || template.templateRill).length > 0 && (
                        <Tr>
                          <Td colSpan={7} p={0}>
                            <Collapse in={expandedRows[template.id]}>
                              <Box
                                p="20px"
                                bg={
                                  colorMode === "dark"
                                    ? "gray.800"
                                    : "gray.50"
                                }
                                borderTop="1px solid"
                                borderColor={
                                  colorMode === "dark"
                                    ? "gray.700"
                                    : "gray.200"
                                }
                              >
                                <Heading size="sm" mb="15px">
                                  Detail Template Rill
                                </Heading>
                                <Table variant="simple" size="sm">
                                  <Thead>
                                    <Tr>
                                      <Th>No</Th>
                                      <Th>Uraian</Th>
                                      <Th>Nilai</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {(template.templateRills || template.templateRill || []).map(
                                      (rill, rillIndex) => (
                                        <Tr key={rill.id}>
                                          <Td>{rillIndex + 1}</Td>
                                          <Td>{rill.uraian || "-"}</Td>
                                          <Td>{formatRupiah(rill.nilai)}</Td>
                                        </Tr>
                                      )
                                    )}
                                  </Tbody>
                                  <Tfoot>
                                    <Tr
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.100"
                                      }
                                    >
                                      <Td
                                        colSpan={2}
                                        fontWeight="bold"
                                        textAlign="right"
                                        fontSize="sm"
                                      >
                                        Total:
                                      </Td>
                                      <Td
                                        fontWeight="bold"
                                        color="primary"
                                        fontSize="sm"
                                      >
                                        {formatRupiah(
                                          (template.templateRills || template.templateRill || []).reduce(
                                            (sum, rill) => sum + (rill.nilai || 0),
                                            0
                                          )
                                        )}
                                      </Td>
                                    </Tr>
                                  </Tfoot>
                                </Table>
                                <Flex justify="flex-end" mt="20px">
                                  <Button
                                    leftIcon={<BsPencil />}
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                    isLoading={updatingStatusId === template.id}
                                    onClick={() => {
                                      const newStatus =
                                        template.status === "aktif"
                                          ? "nonaktif"
                                          : "aktif";
                                      updateStatus(template.id, newStatus);
                                    }}
                                  >
                                    Ubah Status ke{" "}
                                    {template.status === "aktif"
                                      ? "Nonaktif"
                                      : "Aktif"}
                                  </Button>
                                </Flex>
                              </Box>
                            </Collapse>
                          </Td>
                        </Tr>
                      )}
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Pagination */}
          <Box
            mt={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <ReactPaginate
              previousLabel={"←"}
              nextLabel={"→"}
              breakLabel={"..."}
              pageCount={totalPage}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={changePage}
              activeClassName={"item active "}
              breakClassName={"item break-me "}
              containerClassName={"pagination"}
              disabledClassName={"disabled-page"}
              nextClassName={"item next "}
              pageClassName={"item pagination-page "}
              previousClassName={"item previous"}
              forcePage={page}
            />
          </Box>
          
        </Container>
      </Box>
    </Layout>
  );
}

export default templateBPDKeuangan;
