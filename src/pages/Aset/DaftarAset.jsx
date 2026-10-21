import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";
import ExcelJS from "exceljs";
import "../../Style/pagination.css";
import Foto from "../../assets/add_photo.png";
import {
  Select as Select2,
  AsyncSelect,
  CreatableSelect,
} from "chakra-react-select";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Spacer,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

const emptyForm = {
  nama: "",
  kode: "",
  harga: "",
  merek: "",
  spesifikasi: "",
  tanggal: "",
  jenisAsetId: null,
  kondisiAsetId: null,
  unitKerjaId: null,
  pengeluaranId: null,
  selectedPengeluaran: null,
  penanggungjawabId: null,
  selectedPegawai: null,
  fotoExisting: "",
};

function DaftarAset() {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const {
    isOpen: isHapusOpen,
    onOpen: onHapusOpen,
    onClose: onHapusClose,
  } = useDisclosure();
  const {
    isOpen: isFotoOpen,
    onOpen: onFotoOpen,
    onClose: onFotoClose,
  } = useDisclosure();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [filterJenisId, setFilterJenisId] = useState(null);
  const [filterKondisiId, setFilterKondisiId] = useState(null);
  const [jenisList, setJenisList] = useState([]);
  const [kondisiList, setKondisiList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(Foto);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [asetToDelete, setAsetToDelete] = useState(null);
  const [previewFotoUrl, setPreviewFotoUrl] = useState("");
  const [exporting, setExporting] = useState(false);

  const cardBg = colorMode === "dark" ? "gray.800" : "white";
  const headBg = colorMode === "dark" ? "gray.700" : "gray.50";

  const formatTanggal = (value) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatRupiah = (value) =>
    `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  const toDateInput = (value) =>
    value ? String(value).slice(0, 10) : "";

  const selectStyles = {
    container: (provided) => ({ ...provided, borderRadius: "6px" }),
    control: (provided) => ({
      ...provided,
      backgroundColor: "terang",
      border: "0px",
      minHeight: "44px",
    }),
    option: (provided, state) => ({
      ...provided,
      bg: state.isFocused ? "aset" : "white",
      color: state.isFocused ? "white" : "black",
    }),
  };

  const hideIndicators = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  const portalProps = {
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    styles: { menuPortal: (base) => ({ ...base, zIndex: 2000 }) },
  };

  const jenisOptions = jenisList.map((item) => ({
    value: item.id,
    label: item.nama,
  }));
  const kondisiOptions = kondisiList.map((item) => ({
    value: item.id,
    label: item.nama,
  }));
  const unitOptions = unitKerjaList.map((item) => ({
    value: item.id,
    label: item.unitKerja,
  }));

  const fetchSeed = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/seed`);
      setJenisList(res.data.jenis || []);
      setKondisiList(res.data.kondisi || []);
      setUnitKerjaList(res.data.unitKerja || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBaseUrl]);

  const buildFilterParams = (pageValue, limitValue) => {
    const params = new URLSearchParams({
      page: String(pageValue),
      limit: String(limitValue),
    });
    if (appliedKeyword) params.set("q", appliedKeyword);
    if (filterUnitKerjaId) params.set("unitKerjaId", filterUnitKerjaId);
    if (filterJenisId) params.set("jenisAsetId", filterJenisId);
    if (filterKondisiId) params.set("kondisiAsetId", filterKondisiId);
    return params;
  };

  const downloadExcel = async () => {
    if (!totalRows) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada aset yang bisa diekspor",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setExporting(true);
    try {
      const params = buildFilterParams(0, totalRows);
      const res = await axios.get(`${apiBaseUrl}/aset/get?${params.toString()}`);
      const data = res.data.result || [];
      if (!data.length) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada aset yang bisa diekspor",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Daftar Aset");
      const headerStyle = {
        font: { bold: true, color: { argb: "FFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };
      const dataStyle = {
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: { vertical: "middle", wrapText: true },
      };
      const currencyStyle = {
        ...dataStyle,
        alignment: { horizontal: "right", vertical: "middle" },
        numFmt: "#,##0",
      };

      const headerRow = worksheet.addRow([
        "No.",
        "Kode",
        "Nama",
        "Jenis",
        "Merek",
        "Spesifikasi",
        "Harga",
        "Tanggal",
        "Kondisi",
        "Unit Kerja",
        "Penanggung Jawab",
      ]);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });
      headerRow.height = 22;

      data.forEach((item, index) => {
        const dataRow = worksheet.addRow([
          index + 1,
          item.kode || "-",
          item.nama || "-",
          item.jenisAset?.nama || "-",
          item.merek || "-",
          item.spesifikasi || "-",
          Number(item.harga || 0),
          formatTanggal(item.tanggal),
          item.kondisiAset?.nama || "-",
          item.daftarUnitKerja?.unitKerja || "-",
          item.penanggungJawab?.nama || "-",
        ]);
        dataRow.eachCell((cell, colNumber) => {
          if (colNumber === 1) {
            cell.style = {
              ...dataStyle,
              alignment: { horizontal: "center", vertical: "middle" },
            };
          } else if (colNumber === 7) {
            cell.style = currencyStyle;
          } else {
            cell.style = dataStyle;
          }
        });
      });

      worksheet.columns.forEach((column, index) => {
        const widths = [6, 18, 28, 16, 16, 36, 16, 16, 16, 24, 24];
        column.width = widths[index] || 18;
      });

      const currentDate = new Date().toISOString().split("T")[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Daftar_Aset_${currentDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil",
        description: `${data.length} aset berhasil diekspor`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal mengekspor data aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  const fetchAset = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildFilterParams(page, pageLimit);
      const res = await axios.get(`${apiBaseUrl}/aset/get?${params.toString()}`);
      setRows(res.data.result || []);
      setTotalPage(res.data.totalPage || 0);
      setTotalRows(res.data.totalRows || 0);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal memuat data aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [
    apiBaseUrl,
    page,
    appliedKeyword,
    filterUnitKerjaId,
    filterJenisId,
    filterKondisiId,
    pageLimit,
    toast,
  ]);

  useEffect(() => {
    fetchSeed();
  }, [fetchSeed]);

  useEffect(() => {
    fetchAset();
  }, [fetchAset]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(Foto);
    setFileInputKey((key) => key + 1);
  };

  const openTambah = async () => {
    resetForm();
    setField("tanggal", new Date().toISOString().slice(0, 10));
    onFormOpen();
    try {
      const res = await axios.get(`${apiBaseUrl}/aset/get/kode-berikutnya`);
      setField("kode", res.data.kode || "");
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama || "",
      kode: item.kode || "",
      harga: item.harga ?? "",
      merek: item.merek || "",
      spesifikasi: item.spesifikasi || "",
      tanggal: toDateInput(item.tanggal),
      jenisAsetId: item.jenisAsetId || item.jenisAset?.id || null,
      kondisiAsetId: item.kondisiAsetId || item.kondisiAset?.id || null,
      unitKerjaId: item.unitKerjaId || item.daftarUnitKerja?.id || null,
      pengeluaranId: item.pengeluaranId || null,
      selectedPengeluaran: item.pengeluaran
        ? {
            value: item.pengeluaran.id,
            label: `${item.pengeluaran.deskripsi || "-"} — ${formatRupiah(item.pengeluaran.nominal)}`,
          }
        : null,
      penanggungjawabId: item.penanggungjawabId || item.penanggungJawab?.id || null,
      selectedPegawai: item.penanggungJawab
        ? {
            value: item.penanggungJawab.id,
            label: item.penanggungJawab.nama,
          }
        : null,
      fotoExisting: item.foto || "",
    });
    setSelectedFile(null);
    setPreviewUrl(item.foto ? `${apiBaseUrl}${item.foto}` : Foto);
    setFileInputKey((key) => key + 1);
    onFormOpen();
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size / 1024 > 2048) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const createMaster = async (path, nama, setter, field) => {
    try {
      const res = await axios.post(`${apiBaseUrl}${path}`, { nama });
      const created = res.data.result;
      setter((prev) =>
        prev.some((item) => item.id === created.id) ? prev : [...prev, created],
      );
      setField(field, created.id);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menambah pilihan",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const loadPengeluaran = async (inputValue) => {
    const q = inputValue?.trim();
    if (!q) return [];
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pengeluaran/search?q=${encodeURIComponent(q)}`,
      );
      return (res.data.result || []).map((item) => ({
        value: item.id,
        label: `${item.deskripsi || "-"} — ${formatTanggal(item.tanggal)} — ${formatRupiah(item.nominal)}`,
        unitKerjaId: item.unitKerjaId,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadPegawai = async (inputValue) => {
    const q = inputValue?.trim();
    if (!q) return [];
    try {
      const res = await axios.get(
        `${apiBaseUrl}/pegawai/search?q=${encodeURIComponent(q)}`,
      );
      return (res.data.result || []).map((item) => ({
        value: item.id,
        label: item.nip ? `${item.nama} — ${item.nip}` : item.nama,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const simpanAset = async () => {
    if (!form.nama.trim() || !form.kode.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode aset wajib diisi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    if (!form.jenisAsetId || !form.kondisiAsetId || !form.unitKerjaId) {
      toast({
        title: "Error",
        description: "Jenis, kondisi, dan unit kerja wajib dipilih",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const data = new FormData();
    data.append("nama", form.nama.trim());
    data.append("kode", form.kode.trim());
    data.append("harga", form.harga || 0);
    data.append("merek", form.merek);
    data.append("spesifikasi", form.spesifikasi);
    data.append("tanggal", form.tanggal);
    data.append("jenisAsetId", form.jenisAsetId);
    data.append("kondisiAsetId", form.kondisiAsetId);
    data.append("unitKerjaId", form.unitKerjaId);
    if (form.pengeluaranId) data.append("pengeluaranId", form.pengeluaranId);
    if (form.penanggungjawabId)
      data.append("penanggungjawabId", form.penanggungjawabId);
    if (form.fotoExisting && !selectedFile) data.append("foto", form.fotoExisting);
    if (selectedFile) data.append("pic", selectedFile);

    setSubmitting(true);
    try {
      const url = editingId
        ? `${apiBaseUrl}/aset/put/${editingId}`
        : `${apiBaseUrl}/aset/post`;
      await axios.post(url, data);
      toast({
        title: "Berhasil",
        description: editingId ? "Aset berhasil diubah" : "Aset berhasil dicatat",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onFormClose();
      resetForm();
      fetchAset();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menyimpan aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hapusAset = async () => {
    if (!asetToDelete?.id) return;
    try {
      await axios.get(`${apiBaseUrl}/aset/delete/${asetToDelete.id}`);
      toast({
        title: "Berhasil",
        description: "Aset berhasil dihapus",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onHapusClose();
      setAsetToDelete(null);
      fetchAset();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menghapus aset",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <LayoutAset>
      <Box bgColor="secondary" pb="40px" px={{ base: "12px", md: "30px" }}>
        <Container
          maxW="2880px"
          p={{ base: "16px", md: "30px" }}
          bg={cardBg}
          borderRadius="8px"
          boxShadow="sm"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            mb={6}
            gap={4}
          >
            <Box>
              <Heading size="lg">Pencatatan Aset</Heading>
              <Text fontSize="sm" color="gray.500">
                {totalRows} aset tercatat
              </Text>
            </Box>
            <Spacer />
            <Button
              variant="outline"
              onClick={downloadExcel}
              isLoading={exporting}
              isDisabled={!totalRows}
            >
              Export Excel
            </Button>
            <Button variant="primary" onClick={openTambah}>
              Tambah Aset
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3} mb={6}>
            <Input
              placeholder="Cari nama, kode, atau merek"
              value={keyword}
              bg="terang"
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(0);
                  setAppliedKeyword(keyword.trim());
                }
              }}
            />
            <Select2
              options={unitOptions}
              placeholder="Semua unit kerja"
              isClearable
              value={unitOptions.find((opt) => opt.value === filterUnitKerjaId) || null}
              onChange={(opt) => {
                setPage(0);
                setFilterUnitKerjaId(opt?.value || null);
              }}
              chakraStyles={selectStyles}
              {...portalProps}
            />
            <Select2
              options={jenisOptions}
              placeholder="Semua jenis"
              isClearable
              value={jenisOptions.find((opt) => opt.value === filterJenisId) || null}
              onChange={(opt) => {
                setPage(0);
                setFilterJenisId(opt?.value || null);
              }}
              chakraStyles={selectStyles}
              {...portalProps}
            />
            <Select2
              options={kondisiOptions}
              placeholder="Semua kondisi"
              isClearable
              value={
                kondisiOptions.find((opt) => opt.value === filterKondisiId) || null
              }
              onChange={(opt) => {
                setPage(0);
                setFilterKondisiId(opt?.value || null);
              }}
              chakraStyles={selectStyles}
              {...portalProps}
            />
            <Select2
              options={[10, 20, 50, 100].map((jumlah) => ({
                value: jumlah,
                label: `${jumlah} / halaman`,
              }))}
              placeholder="Per halaman"
              value={{
                value: pageLimit,
                label: `${pageLimit} / halaman`,
              }}
              onChange={(opt) => {
                setPage(0);
                setPageLimit(opt?.value || 10);
              }}
              chakraStyles={selectStyles}
              {...portalProps}
            />
          </SimpleGrid>

          {loading ? (
            <>
              <Skeleton height="40px" mb={2} />
              <Skeleton height="40px" mb={2} />
              <Skeleton height="40px" />
            </>
          ) : rows.length === 0 ? (
            <Box py={10} textAlign="center" bg={headBg} borderRadius="md">
              <Text color="gray.500">Belum ada aset</Text>
            </Box>
          ) : (
            <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="8px">
              <Table size="sm">
                <Thead bg={headBg}>
                  <Tr>
                    <Th>Kode</Th>
                    <Th>Nama</Th>
                    <Th>Jenis</Th>
                    <Th>Merek</Th>
                    <Th>Spesifikasi</Th>
                    <Th isNumeric>Harga</Th>
                    <Th>Tanggal</Th>
                    <Th>Kondisi</Th>
                    <Th>Unit Kerja</Th>
                    <Th>Penanggung Jawab</Th>
                    <Th>Pengeluaran</Th>
                    <Th>Foto</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="semibold">{item.kode}</Td>
                      <Td>{item.nama}</Td>
                      <Td>{item.jenisAset?.nama || "-"}</Td>
                      <Td>{item.merek || "-"}</Td>
                      <Td maxW="220px">
                        <Text noOfLines={2}>{item.spesifikasi || "-"}</Text>
                      </Td>
                      <Td isNumeric>{formatRupiah(item.harga)}</Td>
                      <Td>{formatTanggal(item.tanggal)}</Td>
                      <Td>{item.kondisiAset?.nama || "-"}</Td>
                      <Td>{item.daftarUnitKerja?.unitKerja || "-"}</Td>
                      <Td>{item.penanggungJawab?.nama || "-"}</Td>
                      <Td>
                        {item.pengeluaranId ? (
                          <Link to={`/pengeluaran/detail-pengeluaran/${item.pengeluaranId}`}>
                            <Button size="xs" variant="outline" colorScheme="purple">
                              #{item.pengeluaranId}
                            </Button>
                          </Link>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td>
                        <Image
                          src={item.foto ? `${apiBaseUrl}${item.foto}` : Foto}
                          alt={item.nama}
                          boxSize="42px"
                          objectFit="cover"
                          borderRadius="md"
                          cursor={item.foto ? "pointer" : "default"}
                          onClick={() => {
                            if (!item.foto) return;
                            setPreviewFotoUrl(`${apiBaseUrl}${item.foto}`);
                            onFotoOpen();
                          }}
                        />
                      </Td>
                      <Td>
                        <Flex gap={2}>
                          <Link to={`/aset/detail-aset/${item.id}`}>
                            <Button size="xs" colorScheme="blue" variant="outline">
                              Detail
                            </Button>
                          </Link>
                          <Button size="xs" variant="outline" onClick={() => openEdit(item)}>
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => {
                              setAsetToDelete(item);
                              onHapusOpen();
                            }}
                          >
                            Hapus
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Flex mt={4} align="center" justify="space-between" wrap="wrap" gap={3}>
            <Text fontSize="sm" color="gray.500">
              {totalRows} data
            </Text>
            {totalPage > 1 && (
              <ReactPaginate
                previousLabel={"‹"}
                nextLabel={"›"}
                pageCount={totalPage}
                forcePage={page}
                onPageChange={({ selected }) => setPage(selected)}
                activeClassName={"item active "}
                breakClassName={"item break-me "}
                breakLabel={"..."}
                containerClassName={"pagination"}
                disabledClassName={"disabled-page"}
                marginPagesDisplayed={1}
                nextClassName={"item next "}
                pageClassName={"item pagination-page "}
                pageRangeDisplayed={2}
                previousClassName={"item previous"}
              />
            )}
          </Flex>
        </Container>
      </Box>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          onFormClose();
          resetForm();
        }}
        size="4xl"
        scrollBehavior="inside"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? "Ubah Aset" : "Catat Aset"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Kode</FormLabel>
                <Input
                  bg="terang"
                  value={form.kode}
                  onChange={(e) => setField("kode", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nama</FormLabel>
                <Input
                  bg="terang"
                  value={form.nama}
                  onChange={(e) => setField("nama", e.target.value)}
                  placeholder="Nama aset"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Jenis Aset</FormLabel>
                <CreatableSelect
                  options={jenisOptions}
                  placeholder="Pilih atau ketik jenis baru"
                  value={jenisOptions.find((opt) => opt.value === form.jenisAsetId) || null}
                  onChange={(opt) => setField("jenisAsetId", opt?.value || null)}
                  onCreateOption={(nama) =>
                    createMaster("/aset/post/jenis", nama, setJenisList, "jenisAsetId")
                  }
                  components={hideIndicators}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Kondisi</FormLabel>
                <CreatableSelect
                  options={kondisiOptions}
                  placeholder="Pilih atau ketik kondisi baru"
                  value={
                    kondisiOptions.find((opt) => opt.value === form.kondisiAsetId) || null
                  }
                  onChange={(opt) => setField("kondisiAsetId", opt?.value || null)}
                  onCreateOption={(nama) =>
                    createMaster(
                      "/aset/post/kondisi",
                      nama,
                      setKondisiList,
                      "kondisiAsetId",
                    )
                  }
                  components={hideIndicators}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Merek</FormLabel>
                <Input
                  bg="terang"
                  value={form.merek}
                  onChange={(e) => setField("merek", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Harga</FormLabel>
                <Input
                  type="number"
                  bg="terang"
                  value={form.harga}
                  onChange={(e) => setField("harga", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tanggal</FormLabel>
                <Input
                  type="date"
                  bg="terang"
                  value={form.tanggal}
                  onChange={(e) => setField("tanggal", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unit Kerja</FormLabel>
                <Select2
                  options={unitOptions}
                  placeholder="Pilih unit kerja"
                  value={unitOptions.find((opt) => opt.value === form.unitKerjaId) || null}
                  onChange={(opt) => setField("unitKerjaId", opt?.value || null)}
                  components={hideIndicators}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Pengeluaran</FormLabel>
                <AsyncSelect
                  loadOptions={loadPengeluaran}
                  cacheOptions
                  defaultOptions={false}
                  isClearable
                  placeholder="Ketik deskripsi pengeluaran"
                  value={form.selectedPengeluaran}
                  onChange={(opt) => {
                    setForm((prev) => ({
                      ...prev,
                      selectedPengeluaran: opt,
                      pengeluaranId: opt?.value || null,
                      unitKerjaId: prev.unitKerjaId || opt?.unitKerjaId || null,
                    }));
                  }}
                  components={hideIndicators}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Penanggung Jawab</FormLabel>
                <AsyncSelect
                  loadOptions={loadPegawai}
                  cacheOptions
                  defaultOptions={false}
                  isClearable
                  placeholder="Ketik nama pegawai"
                  value={form.selectedPegawai}
                  onChange={(opt) =>
                    setForm((prev) => ({
                      ...prev,
                      selectedPegawai: opt,
                      penanggungjawabId: opt?.value || null,
                    }))
                  }
                  components={hideIndicators}
                  chakraStyles={selectStyles}
                  {...portalProps}
                />
              </FormControl>
              <FormControl gridColumn={{ md: "1 / -1" }}>
                <FormLabel>Spesifikasi</FormLabel>
                <Textarea
                  bg="terang"
                  value={form.spesifikasi}
                  onChange={(e) => setField("spesifikasi", e.target.value)}
                />
              </FormControl>
              <FormControl gridColumn={{ md: "1 / -1" }}>
                <FormLabel>Foto</FormLabel>
                <Center mb={3}>
                  <Image
                    src={previewUrl}
                    alt="preview aset"
                    boxSize="140px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                </Center>
                <Input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  bg="terang"
                  onChange={handleFile}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                onFormClose();
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={simpanAset} isLoading={submitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isHapusOpen} onClose={onHapusClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hapus Aset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Hapus aset {asetToDelete?.kode} — {asetToDelete?.nama}?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onHapusClose}>
              Batal
            </Button>
            <Button colorScheme="red" onClick={hapusAset}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isFotoOpen} onClose={onFotoClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Foto Aset</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Image src={previewFotoUrl} alt="foto aset" w="full" objectFit="contain" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </LayoutAset>
  );
}

export default DaftarAset;
