import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ReactPaginate from "react-paginate";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Container,
  Thead,
  Table,
  Tr,
  Th,
  Td,
  Tbody,
  Heading,
  Divider,
  Badge,
  Flex,
  Spacer,
  SimpleGrid,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import LayoutKPBPN from "../../Componets/KPBPN/LayoutKPBPN";
import "../../Style/pagination.css";

const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE_URL;

const suratJalanSchema = Yup.object({
  nomor: Yup.string().required("Nomor surat jalan wajib diisi"),
  tanggal: Yup.string().required("Tanggal wajib diisi"),
  mitraId: Yup.mixed().nullable().required("Mitra wajib dipilih"),
  transportirId: Yup.mixed().nullable().required("Transportir wajib dipilih"),
  unitKerjaId: Yup.mixed().nullable().required("Proyek wajib dipilih"),
  volume: Yup.number()
    .typeError("Volume harus angka")
    .positive("Volume harus lebih dari 0")
    .required("Volume wajib diisi"),
  supirId: Yup.mixed().nullable().required("Supir wajib dipilih"),
  jamDatang: Yup.string().required("Tanggal wajib diisi"),
  jamPergi: Yup.string().required("Tanggal wajib diisi"),
});

const initialValuesTambah = {
  nomor: "",
  tanggal: "",
  mitraId: null,
  transportirId: null,
  unitKerjaId: null,
  unitKerjaLabel: "",
  volume: "",
  supirId: null,
  jamDatang: "",
  jamPergi: "",
};

const selectStyles = {
  components: {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  },
  chakraStyles: {
    container: (provided) => ({
      ...provided,
      borderRadius: "6px",
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: "terang",
      border: "0px",
      height: "50px",
      _hover: { borderColor: "yellow.700" },
      minHeight: "40px",
    }),
    option: (provided, state) => ({
      ...provided,
      bg: state.isFocused ? "kpbpn" : "white",
      color: state.isFocused ? "white" : "black",
    }),
  },
};

const SuratJalanMitra = () => {
  const toast = useToast();
  const dataListRef = useRef(null);
  const formikRefTambah = useRef(null);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  const [dataSuratJalan, setDataSuratJalan] = useState([]);
  const [dataSeed, setDataSeed] = useState(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCetak, setLoadingCetak] = useState({});

  const [mitraFilterId, setMitraFilterId] = useState(0);
  const [transportirFilterId, setTransportirFilterId] = useState(0);
  const [supirFilterId, setSupirFilterId] = useState(0);
  const [unitKerjaFilterId, setUnitKerjaFilterId] = useState(0);
  const [statusSuratJalanFilterId, setStatusSuratJalanFilterId] = useState(0);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("DESC");

  const allSupir = (dataSeed?.resultMitra || []).flatMap((m) =>
    (m.supirs || []).map((s) => ({
      ...s,
      mitraNama: m.nama,
    })),
  );

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const scrollToDataList = () => {
    dataListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changePage = ({ selected }) => {
    setPage(selected);
    scrollToDataList();
  };

  const fetchSeed = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pengiriman/get/seed`);
      setDataSeed(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal memuat data filter surat jalan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchDataSuratJalan = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/pengiriman/get`, {
        params: {
          page,
          limit,
          mitraId: mitraFilterId || undefined,
          transportirId: transportirFilterId || undefined,
          supirId: supirFilterId || undefined,
          unitKerjaId: unitKerjaFilterId || undefined,
          statusSuratJalanId: statusSuratJalanFilterId || undefined,
          startDate: tanggalAwal || undefined,
          endDate: tanggalAkhir || undefined,
          sortBy,
          sortOrder,
        },
      });
      setDataSuratJalan(res.data.result || []);
      setPages(res.data.totalPage || 0);
      setRows(res.data.totalRows || 0);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal memuat data surat jalan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilter = () => {
    setMitraFilterId(0);
    setTransportirFilterId(0);
    setSupirFilterId(0);
    setUnitKerjaFilterId(0);
    setStatusSuratJalanFilterId(0);
    setTanggalAwal("");
    setTanggalAkhir("");
    setSortBy("tanggal");
    setSortOrder("DESC");
  };

  const handleCloseTambahModal = () => {
    formikRefTambah.current?.resetForm();
    onTambahClose();
  };

  const submitTambahSuratJalan = async (
    values,
    { setSubmitting, resetForm },
  ) => {
    try {
      await axios.post(`${API_BASE}/pengiriman/post`, {
        nomor: values.nomor,
        tanggal: values.tanggal,
        mitraId: values.mitraId,
        transportirId: values.transportirId,
        unitKerjaId: values.unitKerjaId,
        volume: values.volume,
        supirId: values.supirId,
        jamDatang: values.jamDatang,
        jamPergi: values.jamPergi,
      });

      toast({
        title: "Berhasil!",
        description: "Surat jalan berhasil ditambahkan.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      resetForm();
      onTambahClose();
      await fetchDataSuratJalan();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description:
          err.response?.data?.error || "Gagal menambahkan surat jalan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSupirByMitra = (mitraId) => {
    if (!mitraId) return [];
    const mitraData = (dataSeed?.resultMitra || []).find(
      (m) => String(m.id) === String(mitraId),
    );
    return mitraData?.supirs || [];
  };

  const cetakSuratJalan = async (item) => {
    setLoadingCetak((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await axios.get(
        `${API_BASE}/pengiriman/get/cetak/${item.id}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `surat-jalan_${item.nomor || item.id}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: "Dokumen surat jalan berhasil diunduh",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      let message = "Gagal mengunduh dokumen surat jalan";

      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.error || message;
        } catch {
          // gunakan pesan default
        }
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      }

      toast({
        title: "Gagal",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingCetak((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const hasActiveFilter =
    mitraFilterId ||
    transportirFilterId ||
    supirFilterId ||
    unitKerjaFilterId ||
    statusSuratJalanFilterId ||
    tanggalAwal ||
    tanggalAkhir ||
    sortBy !== "tanggal" ||
    sortOrder !== "DESC";

  useEffect(() => {
    fetchSeed();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [
    mitraFilterId,
    transportirFilterId,
    supirFilterId,
    unitKerjaFilterId,
    statusSuratJalanFilterId,
    tanggalAwal,
    tanggalAkhir,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchDataSuratJalan();
  }, [
    page,
    limit,
    mitraFilterId,
    transportirFilterId,
    supirFilterId,
    unitKerjaFilterId,
    statusSuratJalanFilterId,
    tanggalAwal,
    tanggalAkhir,
    sortBy,
    sortOrder,
  ]);

  return (
    <LayoutKPBPN>
      <Box bgColor="secondary" pb="40px" px="30px" minH="90vh">
        <Container variant="primary" p="30px" my="30px" minW="1000px">
          <Flex align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Heading color="kpbpn">Daftar Surat Jalan</Heading>
              <Text fontSize="sm" color="gray.500">
                Total: {rows} data
              </Text>
            </VStack>
            <Spacer />
            <Button variant="primary" onClick={onTambahOpen}>
              + Tambah Surat Jalan
            </Button>
          </Flex>

          <Divider mb={6} />

          <Box mb={6}>
            <Heading size="md" mb={4} color="kpbpn">
              Filter Pencarian
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Transportir
                </FormLabel>
                <Select2
                  options={(dataSeed?.resultTransportir || []).map((val) => ({
                    value: val.id,
                    label: val.plat || `Transportir #${val.id}`,
                  }))}
                  placeholder="Pilih Transportir"
                  onChange={(opt) => setTransportirFilterId(opt?.value || 0)}
                  {...selectStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Supir
                </FormLabel>
                <Select2
                  options={allSupir.map((val) => ({
                    value: val.id,
                    label: `${val.nama} (${val.mitraNama})`,
                  }))}
                  placeholder="Pilih Supir"
                  onChange={(opt) => setSupirFilterId(opt?.value || 0)}
                  {...selectStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Proyek
                </FormLabel>
                <AsyncSelect
                  loadOptions={async (inputValue) => {
                    if (!inputValue) return [];
                    try {
                      const res = await axios.get(
                        `${API_BASE}/admin/search/unit-kerja?q=${encodeURIComponent(inputValue)}`,
                      );
                      return (res.data.result || []).map((val) => ({
                        value: val.id,
                        label: val.unitKerja,
                      }));
                    } catch (err) {
                      console.error("Failed to load options:", err.message);
                      return [];
                    }
                  }}
                  placeholder="Ketik Nama Proyek"
                  onChange={(opt) => setUnitKerjaFilterId(opt?.value || 0)}
                  {...selectStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Status Surat Jalan
                </FormLabel>
                <Select2
                  options={(dataSeed?.resultStatusSuratJalan || []).map(
                    (val) => ({
                      value: val.id,
                      label: val.status || `Status #${val.id}`,
                    }),
                  )}
                  placeholder="Pilih Status"
                  onChange={(opt) =>
                    setStatusSuratJalanFilterId(opt?.value || 0)
                  }
                  {...selectStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tanggal Awal
                </FormLabel>
                <Input
                  bgColor="terang"
                  height="50px"
                  type="date"
                  value={tanggalAwal}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tanggal Akhir
                </FormLabel>
                <Input
                  bgColor="terang"
                  height="50px"
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Urutkan Berdasarkan
                </FormLabel>
                <Select2
                  options={[
                    { value: "tanggal", label: "Tanggal" },
                    { value: "nomor", label: "Nomor" },
                    { value: "volume", label: "Volume" },
                  ]}
                  value={{
                    value: sortBy,
                    label:
                      sortBy === "nomor"
                        ? "Nomor"
                        : sortBy === "volume"
                          ? "Volume"
                          : "Tanggal",
                  }}
                  onChange={(opt) => setSortBy(opt?.value || "tanggal")}
                  {...selectStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Urutan
                </FormLabel>
                <Select2
                  options={
                    sortBy === "volume"
                      ? [
                          { value: "DESC", label: "Volume Terbesar" },
                          { value: "ASC", label: "Volume Terkecil" },
                        ]
                      : sortBy === "nomor"
                        ? [
                            { value: "ASC", label: "Nomor A-Z" },
                            { value: "DESC", label: "Nomor Z-A" },
                          ]
                        : [
                            { value: "DESC", label: "Tanggal Terbaru" },
                            { value: "ASC", label: "Tanggal Terlama" },
                          ]
                  }
                  value={{
                    value: sortOrder,
                    label:
                      sortBy === "volume"
                        ? sortOrder === "ASC"
                          ? "Volume Terkecil"
                          : "Volume Terbesar"
                        : sortBy === "nomor"
                          ? sortOrder === "ASC"
                            ? "Nomor A-Z"
                            : "Nomor Z-A"
                          : sortOrder === "ASC"
                            ? "Tanggal Terlama"
                            : "Tanggal Terbaru",
                  }}
                  onChange={(opt) => setSortOrder(opt?.value || "DESC")}
                  {...selectStyles}
                />
              </FormControl>
            </SimpleGrid>

            {hasActiveFilter && (
              <Button
                mt={4}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={resetFilter}
              >
                Reset Filter
              </Button>
            )}
          </Box>

          <Divider mb={6} />

          <Box ref={dataListRef} scrollMarginTop="88px">
            <Box
              borderRadius="8px"
              overflow="hidden"
              overflowX="auto"
              border="1px solid"
              borderColor="gray.200"
            >
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th textTransform="capitalize">Nomor</Th>
                    <Th textTransform="capitalize">Tanggal</Th>
                    <Th textTransform="capitalize">Mitra</Th>
                    <Th textTransform="capitalize">Transportir</Th>
                    <Th textTransform="capitalize">Proyek</Th>
                    <Th textTransform="capitalize" isNumeric>
                      Volume
                    </Th>
                    <Th textTransform="capitalize">Supir</Th>
                    <Th textTransform="capitalize">Status</Th>{" "}
                    <Th textTransform="capitalize">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <Tr key={idx}>
                        {Array.from({ length: 9 }).map((__, i) => (
                          <Td key={i}>
                            <Skeleton height="20px" />
                          </Td>
                        ))}
                      </Tr>
                    ))
                  ) : dataSuratJalan?.length > 0 ? (
                    dataSuratJalan.map((item) => (
                      <Tr key={item.id}>
                        <Td fontWeight="medium">{item.nomor || "-"}</Td>
                        <Td>{formatTanggal(item.tanggal)}</Td>
                        <Td>{item.mitra?.nama || "-"}</Td>
                        <Td>{item.transportir?.plat || "-"}</Td>
                        <Td>{item.daftarUnitKerja?.unitKerja || "-"}</Td>
                        <Td isNumeric>{item.volume ?? "-"}</Td>
                        <Td>{item.supir?.nama || "-"}</Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {item.statusSuratJalan?.status || "-"}
                          </Badge>
                        </Td>
                        <Td>
                          {item.statusSuratJalanId !== 1 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="teal"
                              isLoading={loadingCetak[item.id]}
                              onClick={() => cetakSuratJalan(item)}
                            >
                              Cetak
                            </Button>
                          ) : (
                            "-"
                          )}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={10}>
                        <VStack spacing={2}>
                          <Text fontSize="lg" color="gray.500">
                            Tidak ada data surat jalan
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {rows > 0 && (
            <Flex
              className="pengeluaran-pagination"
              mt={6}
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
              justify="space-between"
              align="center"
              gap={4}
            >
              <Text fontSize="sm" color="gray.600">
                Menampilkan {page * limit + 1}–
                {Math.min((page + 1) * limit, rows)} dari {rows} data
                {pages > 1 && (
                  <>
                    {" "}
                    · Halaman {page + 1} dari {pages}
                  </>
                )}
              </Text>
              {pages > 1 && (
                <Box overflowX="auto" py={1}>
                  <ReactPaginate
                    previousLabel="←"
                    nextLabel="→"
                    pageCount={pages}
                    onPageChange={changePage}
                    forcePage={page}
                    activeClassName="item active"
                    breakClassName="item break-me"
                    breakLabel="..."
                    containerClassName="pagination"
                    disabledClassName="disabled-page"
                    marginPagesDisplayed={1}
                    nextClassName="item next"
                    pageClassName="item pagination-page"
                    pageRangeDisplayed={2}
                    previousClassName="item previous"
                  />
                </Box>
              )}
            </Flex>
          )}
        </Container>
      </Box>

      <Modal
        isOpen={isTambahOpen}
        onClose={handleCloseTambahModal}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Surat Jalan</ModalHeader>
          <ModalCloseButton />
          <Formik
            innerRef={formikRefTambah}
            initialValues={initialValuesTambah}
            validationSchema={suratJalanSchema}
            onSubmit={submitTambahSuratJalan}
          >
            {({
              values,
              errors,
              touched,
              setFieldValue,
              isSubmitting,
              handleChange,
              handleBlur,
            }) => (
              <Form>
                <ModalBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isInvalid={touched.nomor && errors.nomor}>
                      <FormLabel>Nomor Surat Jalan</FormLabel>
                      <Input
                        name="nomor"
                        bgColor="terang"
                        value={values.nomor}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Contoh: SJ-001/2026"
                      />
                      <FormErrorMessage>{errors.nomor}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.tanggal && errors.tanggal}>
                      <FormLabel>Tanggal</FormLabel>
                      <Input
                        name="tanggal"
                        type="date"
                        bgColor="terang"
                        value={values.tanggal}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <FormErrorMessage>{errors.tanggal}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.mitraId && errors.mitraId}>
                      <FormLabel>Mitra</FormLabel>
                      <Select2
                        options={(dataSeed?.resultMitra || []).map((val) => ({
                          value: val.id,
                          label: val.nama || `Mitra #${val.id}`,
                        }))}
                        placeholder="Pilih Mitra"
                        value={
                          values.mitraId
                            ? {
                                value: values.mitraId,
                                label:
                                  (dataSeed?.resultMitra || []).find(
                                    (m) => m.id === values.mitraId,
                                  )?.nama || `Mitra #${values.mitraId}`,
                              }
                            : null
                        }
                        onChange={(opt) => {
                          setFieldValue("mitraId", opt?.value || null);
                          setFieldValue("supirId", null);
                        }}
                        {...selectStyles}
                      />
                      <FormErrorMessage>{errors.mitraId}</FormErrorMessage>
                    </FormControl>
                    <FormControl
                      isInvalid={touched.transportirId && errors.transportirId}
                    >
                      <FormLabel>Transportir</FormLabel>
                      <Select2
                        options={(dataSeed?.resultTransportir || []).map(
                          (val) => ({
                            value: val.id,
                            label: val.plat || `Transportir #${val.id}`,
                          }),
                        )}
                        placeholder="Pilih Transportir"
                        value={
                          values.transportirId
                            ? {
                                value: values.transportirId,
                                label:
                                  (dataSeed?.resultTransportir || []).find(
                                    (t) => t.id === values.transportirId,
                                  )?.plat ||
                                  `Transportir #${values.transportirId}`,
                              }
                            : null
                        }
                        onChange={(opt) =>
                          setFieldValue("transportirId", opt?.value || null)
                        }
                        {...selectStyles}
                      />
                      <FormErrorMessage>
                        {errors.transportirId}
                      </FormErrorMessage>
                    </FormControl>
                    <FormControl
                      isInvalid={touched.unitKerjaId && errors.unitKerjaId}
                    >
                      <FormLabel>Proyek</FormLabel>
                      <AsyncSelect
                        loadOptions={async (inputValue) => {
                          if (!inputValue) return [];
                          try {
                            const res = await axios.get(
                              `${API_BASE}/admin/search/unit-kerja?q=${encodeURIComponent(inputValue)}`,
                            );
                            return (res.data.result || []).map((val) => ({
                              value: val.id,
                              label: val.unitKerja,
                            }));
                          } catch (err) {
                            console.error(
                              "Failed to load options:",
                              err.message,
                            );
                            return [];
                          }
                        }}
                        placeholder="Ketik Nama Proyek"
                        value={
                          values.unitKerjaId
                            ? {
                                value: values.unitKerjaId,
                                label: values.unitKerjaLabel,
                              }
                            : null
                        }
                        onChange={(opt) => {
                          setFieldValue("unitKerjaId", opt?.value || null);
                          setFieldValue("unitKerjaLabel", opt?.label || "");
                        }}
                        {...selectStyles}
                      />
                      <FormErrorMessage>{errors.unitKerjaId}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.volume && errors.volume}>
                      <FormLabel>Volume</FormLabel>
                      <Input
                        name="volume"
                        type="number"
                        bgColor="terang"
                        value={values.volume}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Masukkan volume"
                      />
                      <FormErrorMessage>{errors.volume}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={touched.supirId && errors.supirId}>
                      <FormLabel>Supir</FormLabel>
                      <Select2
                        options={getSupirByMitra(values.mitraId).map((val) => ({
                          value: val.id,
                          label: val.nama || `Supir #${val.id}`,
                        }))}
                        placeholder={
                          values.mitraId
                            ? "Pilih Supir"
                            : "Pilih mitra terlebih dahulu"
                        }
                        isDisabled={!values.mitraId}
                        value={
                          values.supirId
                            ? {
                                value: values.supirId,
                                label:
                                  getSupirByMitra(values.mitraId).find(
                                    (s) => s.id === values.supirId,
                                  )?.nama || `Supir #${values.supirId}`,
                              }
                            : null
                        }
                        onChange={(opt) =>
                          setFieldValue("supirId", opt?.value || null)
                        }
                        {...selectStyles}
                      />
                      <FormErrorMessage>{errors.supirId}</FormErrorMessage>
                    </FormControl>
                    <FormControl
                      isInvalid={touched.jamPergi && errors.jamPergi}
                    >
                      <FormLabel>Jam Pergi</FormLabel>
                      <Input
                        name="jamPergi"
                        type="time"
                        bgColor="terang"
                        value={values.jamPergi}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Masukkan waktu kendaraan berangkat"
                      />
                      <FormErrorMessage>{errors.jamPergi}</FormErrorMessage>
                    </FormControl>{" "}
                    <FormControl
                      isInvalid={touched.jamDatang && errors.jamDatang}
                    >
                      <FormLabel>Jam Datang</FormLabel>
                      <Input
                        name="jamDatang"
                        type="time"
                        bgColor="terang"
                        value={values.jamDatang}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Masukkan waktu kendaraan berangkat"
                      />
                      <FormErrorMessage>{errors.jamDatang}</FormErrorMessage>
                    </FormControl>
                  </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="ghost"
                    mr={3}
                    onClick={handleCloseTambahModal}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Simpan
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </LayoutKPBPN>
  );
};

export default SuratJalanMitra;
