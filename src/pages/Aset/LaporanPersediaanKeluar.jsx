import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
import Foto from "../../assets/add_photo.png";
import ExcelJS from "exceljs";
import {
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Image,
  ModalCloseButton,
  Container,
  FormControl,
  FormLabel,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Heading,
  SimpleGrid,
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useColorMode,
  Stack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import { useDisclosure } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

function LaporanPersediaanKeluar(props) {
  const [DataPersediaan, setDataPersediaan] = useState([]);
  const [page, setPage] = useState(0);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [spesifikasi, setSpesifikasi] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [harga, setHarga] = useState(0);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [persediaanId, setPersediaanId] = useState(0);
  const [jumlahKeluar, setJumlahKeluar] = useState(0);
  const [tujuan, setTujuan] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [maxKeluar, setMaxKeluar] = useState(0);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [dataUnitKerja, setDataUnitKerja] = useState([]);
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const FILTER_ALL = "all";
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const {
    isOpen: isModalKeluarOpen,
    onOpen: onModalKeluarOpen,
    onClose: onModalKeluarClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isHapusOpen,
    onOpen: onHapusOpen,
    onClose: onHapusClose,
  } = useDisclosure();
  const [editingKeluar, setEditingKeluar] = useState(null);
  const [keluarToDelete, setKeluarToDelete] = useState(null);
  const [editJumlahKeluar, setEditJumlahKeluar] = useState("");
  const [editTanggal, setEditTanggal] = useState("");
  const [editTujuan, setEditTujuan] = useState("");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editMaxKeluar, setEditMaxKeluar] = useState(0);
  const handleSubmitChange = (field, val) => {
    console.log(field, val);
    if (field == "spek") {
      setSpesifikasi(val);
    } else if (field == "jumlah") {
      setJumlah(parseInt(val));
    } else if (field == "harga") {
      setHarga(parseInt(val));
    } else if (field == "tanggal") {
      setTanggal(val);
    } else if (field == "keterangan") {
      setKeterangan(val);
    }
  };
  async function fetchUnitKerja() {
    await axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
      )
      .then((res) => {
        setDataUnitKerja(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function fetchPersediaanKeluar(unitKerjaIdParam) {
    const id = unitKerjaIdParam ?? filterUnitKerjaId;
    if (!id) return;

    try {
      const params = {
        laporanId: props.match.params.id,
      };
      if (id !== FILTER_ALL) {
        params.unitKerjaId = id;
      }

      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/persediaan/get/detail-keluar`,
        { params }
      );

      setDataPersediaan(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  const effectiveUnitKerjaId =
    filterUnitKerjaId && filterUnitKerjaId !== FILTER_ALL
      ? filterUnitKerjaId
      : user[0]?.unitKerja_profile?.id;

  const handleTambahKeluar = (itemId, sisaStok) => {
    setSelectedItemId(itemId);
    setMaxKeluar(sisaStok || 0);
    setJumlahKeluar(0);
    setTujuan("");
    setTanggal("");
    onModalKeluarOpen();
  };

  const resetEditForm = () => {
    setEditingKeluar(null);
    setEditJumlahKeluar("");
    setEditTanggal("");
    setEditTujuan("");
    setEditKeterangan("");
    setEditMaxKeluar(0);
  };

  const handleCloseEditModal = () => {
    onEditClose();
    resetEditForm();
  };

  const openEditModal = (row, group) => {
    if (!row?.stokKeluarId) return;

    setEditingKeluar({
      ...row,
      namaPersediaan: group?.namaPersediaan,
    });
    setEditJumlahKeluar(row.jumlahKeluar ?? "");
    setEditTanggal(
      row.tanggal ? new Date(row.tanggal).toISOString().split("T")[0] : "",
    );
    setEditTujuan(row.tujuan || "");
    setEditKeterangan(row.keterangan || "");
    setEditMaxKeluar(
      (Number(group?.sisa) || 0) + (Number(row.jumlahKeluar) || 0),
    );
    onEditOpen();
  };

  const openHapusModal = (row, group) => {
    if (!row?.stokKeluarId) return;

    setKeluarToDelete({
      ...row,
      namaPersediaan: group?.namaPersediaan,
    });
    onHapusOpen();
  };

  const handleCloseHapusModal = () => {
    onHapusClose();
    setKeluarToDelete(null);
  };

  const editStokKeluar = () => {
    if (!editingKeluar?.stokKeluarId) return;

    if (!editJumlahKeluar || !editTujuan || !editTanggal) {
      toast({
        title: "Error!",
        description: "Mohon isi jumlah, tanggal, dan tujuan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (parseInt(editJumlahKeluar, 10) > editMaxKeluar) {
      toast({
        title: "Error!",
        description: `Jumlah melebihi sisa stok (${editMaxKeluar})`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/edit/keluar`,
        {
          id: editingKeluar.stokKeluarId,
          jumlah: parseInt(editJumlahKeluar, 10),
          tujuan: editTujuan,
          tanggal: editTanggal,
          keterangan: editKeterangan,
        },
      )
      .then(() => {
        toast({
          title: "Berhasil!",
          description: "Data persediaan keluar berhasil diubah.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleCloseEditModal();
        fetchPersediaanKeluar();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message ||
            "Gagal mengubah data persediaan keluar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const hapusStokKeluar = () => {
    if (!keluarToDelete?.stokKeluarId) return;

    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/delete/keluar/${keluarToDelete.stokKeluarId}`,
      )
      .then(() => {
        toast({
          title: "Berhasil!",
          description: "Data persediaan keluar berhasil dihapus.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        handleCloseHapusModal();
        fetchPersediaanKeluar();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message ||
            "Gagal menghapus data persediaan keluar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const showAksiKeluar =
    DataPersediaan?.periode?.statusLaporan === "buka";

  const renderRowActions = (row, group) => {
    if (!showAksiKeluar || !row?.stokKeluarId) return null;

    return (
      <HStack spacing={1} mt={1} flexWrap="wrap">
        <Button
          size="xs"
          variant="outline"
          colorScheme="blue"
          onClick={() => openEditModal(row, group)}
        >
          Edit
        </Button>
        <Button
          size="xs"
          variant="outline"
          colorScheme="red"
          onClick={() => openHapusModal(row, group)}
        >
          Hapus
        </Button>
      </HStack>
    );
  };

  const submitPersediaanKeluar = () => {
    if (!jumlahKeluar || !tujuan) {
      toast({
        title: "Error!",
        description: "Mohon isi jumlah dan tujuan",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (parseInt(jumlahKeluar) > maxKeluar) {
      toast({
        title: "Error!",
        description: `Jumlah melebihi sisa stok (${maxKeluar})`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(selectedItemId);
    axios
      .post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/persediaan/post/keluar`,
        {
          stokMasukId: selectedItemId,
          jumlah: parseInt(jumlahKeluar),
          tujuan: tujuan,
          unitKerjaId: effectiveUnitKerjaId,
          laporanPersediaanId: props.match.params.id,
          tanggal,
        }
      )
      .then((res) => {
        console.log(res.status, res.data, "Persediaan keluar berhasil");
        toast({
          title: "Berhasil!",
          description: "Data persediaan keluar berhasil ditambahkan.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onModalKeluarClose();
        fetchPersediaanKeluar();
      })
      .catch((err) => {
        console.error(err.message);
        toast({
          title: "Error!",
          description:
            err.response?.data?.message ||
            "Gagal menambahkan data persediaan keluar",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const downloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Persediaan Keluar");

      // Set header style
      const headerStyle = {
        font: { bold: true, color: { argb: "FFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4472C4" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Set data style
      const dataStyle = {
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: { vertical: "middle" },
      };

      // Set number style
      const numberStyle = {
        ...dataStyle,
        alignment: { horizontal: "right", vertical: "middle" },
      };

      // Set currency style
      const currencyStyle = {
        ...dataStyle,
        alignment: { horizontal: "right", vertical: "middle" },
        numFmt: "#,##0",
      };

      // Add headers
      const headers = [
        "No.",
        "Nama Persediaan",
        "Kode Barang",
        "Harga Satuan",
        "Stok Awal",
        "Tanggal",
        "Tujuan",
        "Jumlah Keluar",
        "Sisa",
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });

      // Add data rows
      let rowNumber = 1;
      grouped.forEach((group) => {
        group.rows.forEach((row, idx) => {
          const dataRow = worksheet.addRow([
            rowNumber,
            idx === 0 ? group.namaPersediaan : "",
            idx === 0 ? group.kodeBarang : "",
            group.isHargaSatuanUniform
              ? group.mergedHargaSatuan
              : row.hargaSatuan,
            idx === 0 ? group.stokAwal : "",
            row.tanggal
              ? new Date(row.tanggal).toLocaleDateString("id-ID")
              : "-",
            row.tujuan || "-",
            row.jumlahKeluar,
            idx === 0 ? group.sisa : "",
          ]);

          // Apply styles
          dataRow.eachCell((cell, colNumber) => {
            if (colNumber === 1) {
              // No.
              cell.style = {
                ...dataStyle,
                alignment: { horizontal: "center", vertical: "middle" },
              };
            } else if (colNumber === 4) {
              // Harga Satuan
              cell.style = currencyStyle;
            } else if (colNumber === 5 || colNumber === 8 || colNumber === 9) {
              // Stok Awal, Jumlah Keluar, Sisa
              cell.style = numberStyle;
            } else {
              cell.style = dataStyle;
            }
          });

          if (idx === 0) rowNumber++;
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 30);
      });

      // Generate filename
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Laporan_Persediaan_Keluar_${currentDate}.xlsx`;

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Berhasil!",
        description: "File Excel berhasil diunduh.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast({
        title: "Error!",
        description: "Gagal mengunduh file Excel.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
      fetchPersediaanKeluar(filterUnitKerjaId);
    }
  }, [page, filterUnitKerjaId]);

  const unitKerjaFilterOptions = [
    { value: FILTER_ALL, label: "Semua Unit Kerja" },
    ...(dataUnitKerja?.map((val) => ({
      value: val.id,
      label: val.unitKerja,
    })) || []),
  ];
  // Siapkan data terkelompok per persediaan, agar Nama Persediaan tidak berulang
  const grouped = Array.isArray(DataPersediaan?.data)
    ? DataPersediaan.data.map((item) => {
        const stokKeluarList = Array.isArray(item?.stokKeluar)
          ? item.stokKeluar
          : [];
        const rows =
          stokKeluarList.length > 0
            ? stokKeluarList.map((keluar) => ({
                key: `${item?.persediaanId}-${keluar?.id}`,
                stokKeluarId: keluar?.id ?? null,
                jumlahKeluar: keluar?.jumlah ?? 0,
                hargaSatuan: keluar?.hargaSatuan ?? 0,
                tanggal: keluar?.tanggal || null,
                tujuan: keluar?.tujuan || null,
                keterangan: keluar?.keterangan || null,
                stokMasukId: item?.stokMasukId ?? null,
              }))
            : [
                {
                  key: `${item?.persediaanId}-empty`,
                  jumlahKeluar: 0,
                  hargaSatuan: 0,
                  tanggal: null,
                  tujuan: null,
                  stokMasukId: null,
                },
              ];
        const allPrices = rows.map((r) => Number(r.hargaSatuan) || 0);
        const isHargaSatuanUniform = new Set(allPrices).size <= 1;
        const totalKeluar = rows.reduce(
          (sum, row) => sum + (Number(row.jumlahKeluar) || 0),
          0
        );
        const stokMasukIds = rows
          .map((r) => r.stokMasukId)
          .filter((v) => v != null);
        const isStokMasukIdUniform = new Set(stokMasukIds).size <= 1;
        const groupStokMasukId = isStokMasukIdUniform
          ? stokMasukIds[0] ?? null
          : null;
        return {
          groupKey: item?.persediaanId ?? item?.kodeBarang ?? Math.random(),
          namaPersediaan: item?.namaPersediaan || "-",
          stokMasukId: item?.stokMasukId,
          kodeBarang: item?.kodeBarang || "-",
          sisa: item?.sisa ?? 0,
          isHargaSatuanUniform,
          mergedHargaSatuan: isHargaSatuanUniform ? allPrices[0] || 0 : null,
          rows,
          totalKeluar,
          stokAwal: Number(item?.stokAwal) || 0,
          foto: item?.foto || null,
          isStokMasukIdUniform,
          groupStokMasukId,
        };
      })
    : [];

  const summary = useMemo(() => {
    const totalBarang = grouped.length;
    const totalKeluar = grouped.reduce((s, g) => s + g.totalKeluar, 0);
    const totalSisa = grouped.reduce((s, g) => s + (Number(g.sisa) || 0), 0);
    return { totalBarang, totalKeluar, totalSisa };
  }, [grouped]);

  const periode = DataPersediaan?.periode;
  const formatTanggal = (d) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
  const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
  const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const renderFoto = (foto, size = "50px") =>
    foto ? (
      <Image
        src={`${apiBaseUrl}${foto}`}
        alt="foto persediaan"
        boxSize={size}
        objectFit="cover"
        borderRadius="md"
      />
    ) : (
      <Image
        src={Foto}
        alt="no foto"
        boxSize={size}
        objectFit="cover"
        borderRadius="md"
        opacity={0.5}
      />
    );

  const getValidRows = (group) =>
    group.rows.filter((r) => r.jumlahKeluar > 0 || r.tanggal || r.tujuan);

  let groupNumber = 0;

  const InfoRow = ({ label, value, valueColor }) => (
    <Flex justify="space-between" align="flex-start" py={1.5} gap={3}>
      <Text fontSize="sm" color="gray.600" flexShrink={0}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" textAlign="right" color={valueColor}>
        {value}
      </Text>
    </Flex>
  );

  const PageHeader = () => (
    <Box mb={6}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={3}
        mb={4}
      >
        <Heading size={{ base: "md", md: "lg" }} color="aset">
          Laporan Persediaan Keluar
        </Heading>
        {periode?.statusLaporan && (
          <Badge
            alignSelf={{ base: "flex-start", md: "center" }}
            colorScheme={periode.statusLaporan === "buka" ? "green" : "red"}
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="md"
          >
            Periode {periode.statusLaporan === "buka" ? "Buka" : "Tutup"}
          </Badge>
        )}
      </Flex>

      {periode && (
        <Box
          p={3}
          mb={4}
          borderRadius="md"
          bg={colorMode === "dark" ? "gray.700" : "blue.50"}
          borderLeft="4px solid"
          borderLeftColor="aset"
        >
          <Text fontSize="sm" color="gray.600">
            Periode Laporan
          </Text>
          <Text fontWeight="bold">
            {formatTanggal(periode.tanggalAwal)} — {formatTanggal(periode.tanggalAkhir)}
          </Text>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
        <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"} textAlign="center">
          <Text fontSize="xs" color="gray.500">Jenis Barang</Text>
          <Text fontSize="xl" fontWeight="bold" color="aset">{summary.totalBarang}</Text>
        </Box>
        <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"} textAlign="center">
          <Text fontSize="xs" color="gray.500">Total Keluar</Text>
          <Text fontSize="xl" fontWeight="bold" color="red.500">{summary.totalKeluar}</Text>
        </Box>
        <Box p={3} borderRadius="md" bg={colorMode === "dark" ? "gray.700" : "gray.50"} textAlign="center">
          <Text fontSize="xs" color="gray.500">Total Sisa Stok</Text>
          <Text fontSize="xl" fontWeight="bold" color="green.600">{summary.totalSisa}</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );

  const renderMobileCards = () => {
    if (!grouped.length) {
      return (
        <Box py={8} textAlign="center" bg="gray.50" borderRadius="md">
          <Text color="gray.500">Tidak ada data persediaan keluar</Text>
        </Box>
      );
    }

    let no = 0;
    return grouped.map((group) => {
      no += 1;
      const showTambah = periode?.statusLaporan === "buka";
      const validRows = getValidRows(group);

      return (
        <Box
          key={group.groupKey}
          mb={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          bg={colorMode === "dark" ? "gray.700" : "white"}
          boxShadow="sm"
        >
          <Box bg="aset" px={4} py={3} color="white">
            <HStack spacing={3} align="center">
              {renderFoto(group.foto, "56px")}
              <Box flex={1}>
                <Text fontSize="xs" opacity={0.85}>#{no}</Text>
                <Text fontWeight="bold" fontSize="md">{group.namaPersediaan}</Text>
                <Text fontSize="sm" opacity={0.9}>Kode: {group.kodeBarang}</Text>
              </Box>
            </HStack>
          </Box>

          <Box px={4} py={3}>
            <HStack spacing={2} flexWrap="wrap" mb={3}>
              <Badge colorScheme="blue">Awal: {group.stokAwal}</Badge>
              <Badge colorScheme="red">Keluar: {group.totalKeluar}</Badge>
              <Badge colorScheme="green">Sisa: {group.sisa}</Badge>
            </HStack>

            <InfoRow
              label="Harga Satuan"
              value={
                group.isHargaSatuanUniform
                  ? formatRupiah(group.mergedHargaSatuan)
                  : "Bervariasi per transaksi"
              }
            />

            <Divider my={3} />
            <Text fontSize="sm" fontWeight="bold" color="aset" mb={2}>
              Riwayat Pengeluaran
            </Text>

            {validRows.length === 0 ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic" py={2}>
                Belum ada pengeluaran
              </Text>
            ) : (
              validRows.map((row, idx) => (
                <Box
                  key={row.key}
                  p={3}
                  mb={2}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.100"
                  bg={colorMode === "dark" ? "gray.600" : "gray.50"}
                >
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    #{idx + 1}
                  </Text>
                  <InfoRow
                    label="Tanggal"
                    value={row.tanggal ? formatTanggal(row.tanggal) : "-"}
                  />
                  <InfoRow label="Tujuan" value={row.tujuan || "-"} />
                  {!group.isHargaSatuanUniform && (
                    <InfoRow label="Harga Satuan" value={formatRupiah(row.hargaSatuan)} />
                  )}
                  <InfoRow
                    label="Jumlah Keluar"
                    value={row.jumlahKeluar}
                    valueColor="red.500"
                  />
                  {renderRowActions(row, group)}
                </Box>
              ))
            )}

            {showTambah && (
              <Button
                w="full"
                mt={3}
                size="sm"
                colorScheme="blue"
                onClick={() => handleTambahKeluar(group.stokMasukId, group.sisa)}
              >
                + Tambah Pengeluaran
              </Button>
            )}
          </Box>
        </Box>
      );
    });
  };

  return (
    <>
      <LayoutAset>
        <Container
          maxW={"3280px"}
          bgColor={"secondary"}
          pb={"40px"}
          px={{ base: "12px", md: "30px" }}
        >
          <Box
            style={{ overflowX: "auto" }}
            bgColor={"white"}
            p={{ base: "16px", md: "30px" }}
            borderRadius={"5px"}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <PageHeader />

            <Flex
              mb={4}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "flex-end" }}
              gap={4}
            >
              <FormControl maxW={{ base: "full", md: "320px" }}>
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
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "aset" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <Button
                leftIcon={<BsFileEarmarkArrowDown />}
                colorScheme="green"
                onClick={downloadExcel}
                size="md"
                w={{ base: "full", md: "auto" }}
                alignSelf={{ base: "stretch", md: "flex-end" }}
              >
                Download Excel
              </Button>
            </Flex>

            <Box display={{ base: "block", md: "none" }} mb={4}>
              {renderMobileCards()}
            </Box>

            <Box display={{ base: "none", md: "block" }} overflowX="auto">
            <Table variant={"aset"}>
              <Thead>
                <Tr>
                  <Th>No.</Th>
                  <Th>Foto</Th>
                  <Th maxWidth={"20px"}>Nama Persediaan</Th>
                  <Th>Kode Barang</Th>
                  <Th>Harga Satuan</Th>
                  <Th>Stok Awal</Th>
                  <Th>Tanggal</Th>
                  <Th>Tujuan</Th>
                  <Th isNumeric>Jumlah Keluar</Th>
                  <Th>Sisa</Th>
                  <Th>Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                {grouped && grouped.length > 0 ? (
                  grouped.flatMap((group) => {
                    const rowCount = group.rows.length;
                    const groupBg = groupNumber % 2 === 0 ? "gray.50" : "white";
                    const noCell = (
                      <Td rowSpan={rowCount} bg={groupBg} fontWeight="bold">
                        {++groupNumber}
                      </Td>
                    );
                    const fotoCell = (
                      <Td rowSpan={rowCount} bg={groupBg}>
                        {renderFoto(group.foto)}
                      </Td>
                    );
                    const namaCell = (
                      <Td rowSpan={rowCount} bg={groupBg} fontWeight="bold" maxW="200px">
                        {group.namaPersediaan}
                      </Td>
                    );
                    const kodeCell = (
                      <Td rowSpan={rowCount} bg={groupBg}>{group.kodeBarang}</Td>
                    );
                    const sisaCell = (
                      <Td rowSpan={rowCount} bg={groupBg} fontWeight="bold" color="green.600">
                        {group.sisa}
                      </Td>
                    );
                    const hargaMergedCell = group.isHargaSatuanUniform ? (
                      <Td rowSpan={rowCount} bg={groupBg} isNumeric>
                        {formatRupiah(group.mergedHargaSatuan)}
                      </Td>
                    ) : null;
                    const stokAwalCell = (
                      <Td rowSpan={rowCount} bg={groupBg} fontWeight="semibold">
                        {group.stokAwal}
                      </Td>
                    );
                    return group.rows.map((row, idx) => (
                      <Tr key={row.key} bg={idx === 0 ? groupBg : undefined}>
                        {idx === 0 && noCell}
                        {idx === 0 && fotoCell}
                        {idx === 0 && namaCell}
                        {idx === 0 && kodeCell}
                        {group.isHargaSatuanUniform ? (
                          idx === 0 && hargaMergedCell
                        ) : (
                          <Td isNumeric>{formatRupiah(row.hargaSatuan)}</Td>
                        )}
                        {idx === 0 && stokAwalCell}
                        <Td>
                          {row.tanggal ? formatTanggal(row.tanggal) : "-"}
                        </Td>
                        <Td maxW="180px" whiteSpace="normal">
                          {row.tujuan || "-"}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="red.500">
                          {row.jumlahKeluar > 0 ? row.jumlahKeluar : "-"}
                        </Td>

                        {idx === 0 && sisaCell}
                        <Td>
                          <Flex direction="column" gap={1} align="flex-start">
                            {idx === 0 && showAksiKeluar && (
                              <Button
                                onClick={() =>
                                  handleTambahKeluar(
                                    group.stokMasukId,
                                    group.sisa,
                                  )
                                }
                                size="sm"
                                colorScheme="blue"
                              >
                                Tambah
                              </Button>
                            )}
                            {renderRowActions(row, group)}
                          </Flex>
                        </Td>
                      </Tr>
                    ));
                  })
                ) : (
                  <Tr>
                    <Td colSpan={11} textAlign="center">
                      Tidak ada data persediaan keluar
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
            </Box>
          </Box>
        </Container>

        {/* Modal Tambah Persediaan Keluar */}
        <Modal
          closeOnOverlayClick={false}
          isOpen={isModalKeluarOpen}
          onClose={onModalKeluarClose}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth={{ base: "95vw", md: "600px" }} mx={{ base: 2, md: 0 }}>
            <ModalHeader>
              <HStack>
                <Box bgColor={"aset"} width={"30px"} height={"30px"}></Box>
                <Heading color={"aset"} fontSize="24px">
                  Tambah Persediaan Keluar
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box p={{ base: "12px", md: "20px" }}>
                <Box
                  mb={4}
                  p={3}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                >
                  <Text fontSize="sm" color="gray.600">Sisa stok tersedia</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {maxKeluar}
                  </Text>
                </Box>
                <FormControl my={"20px"}>
                  <FormLabel fontSize={{ base: "md", md: "lg" }}>Jumlah Keluar</FormLabel>
                  <Input
                    height={"50px"}
                    bgColor={"terang"}
                    type="number"
                    min={1}
                    max={maxKeluar}
                    value={jumlahKeluar}
                    onChange={(e) => setJumlahKeluar(e.target.value)}
                    placeholder={`Maks. ${maxKeluar}`}
                  />
                </FormControl>
                <FormControl my={"20px"}>
                  <FormLabel fontSize={{ base: "md", md: "lg" }}>Tanggal</FormLabel>
                  <Input
                    type={"date"}
                    height={"60px"}
                    bgColor={"terang"}
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    placeholder="Masukkan tanggal"
                    min={DataPersediaan?.periode?.tanggalAwal.split("T")[0]} // Mulai dari 1 Januari 2024
                    max={DataPersediaan?.periode?.tanggalAkhir.split("T")[0]} // Sampai 31 Desember 2024
                  />
                </FormControl>
                <FormControl my={"20px"}>
                  <FormLabel fontSize={{ base: "md", md: "lg" }}>Tujuan</FormLabel>
                  <Textarea
                    height={"80px"}
                    bgColor={"terang"}
                    value={tujuan}
                    onChange={(e) => setTujuan(e.target.value)}
                    placeholder="Masukkan tujuan pengeluaran barang"
                  />
                </FormControl>
              </Box>
            </ModalBody>

            <ModalFooter pe={"30px"} pb={"20px"}>
              <Button
                onClick={submitPersediaanKeluar}
                variant={"primary"}
                mr={3}
              >
                Simpan
              </Button>
              <Button onClick={onModalKeluarClose} variant="ghost">
                Batal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Edit Persediaan Keluar */}
        <Modal
          closeOnOverlayClick={false}
          isOpen={isEditOpen}
          onClose={handleCloseEditModal}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            borderRadius="10px"
            maxWidth={{ base: "95vw", md: "600px" }}
            mx={{ base: 2, md: 0 }}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <ModalHeader color={colorMode === "dark" ? "white" : "gray.700"}>
              Edit Persediaan Keluar
            </ModalHeader>
            <ModalCloseButton
              color={colorMode === "dark" ? "white" : "gray.700"}
            />
            <ModalBody>
              {editingKeluar && (
                <Box
                  mb={4}
                  p={3}
                  borderRadius="md"
                  bg={colorMode === "dark" ? "gray.700" : "blue.50"}
                >
                  <Text fontSize="sm" color="gray.600">
                    Barang
                  </Text>
                  <Text fontWeight="bold">
                    {editingKeluar.namaPersediaan || "-"}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    Maks. jumlah keluar
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    {editMaxKeluar}
                  </Text>
                </Box>
              )}
              <FormControl my="16px">
                <FormLabel>Jumlah Keluar</FormLabel>
                <Input
                  height="50px"
                  bgColor="terang"
                  type="number"
                  min={1}
                  max={editMaxKeluar}
                  value={editJumlahKeluar}
                  onChange={(e) => setEditJumlahKeluar(e.target.value)}
                  placeholder={`Maks. ${editMaxKeluar}`}
                />
              </FormControl>
              <FormControl my="16px">
                <FormLabel>Tanggal</FormLabel>
                <Input
                  type="date"
                  height="50px"
                  bgColor="terang"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                  min={DataPersediaan?.periode?.tanggalAwal?.split("T")[0]}
                  max={DataPersediaan?.periode?.tanggalAkhir?.split("T")[0]}
                />
              </FormControl>
              <FormControl my="16px">
                <FormLabel>Tujuan</FormLabel>
                <Textarea
                  height="80px"
                  bgColor="terang"
                  value={editTujuan}
                  onChange={(e) => setEditTujuan(e.target.value)}
                  placeholder="Masukkan tujuan pengeluaran barang"
                />
              </FormControl>
              <FormControl my="16px">
                <FormLabel>Keterangan</FormLabel>
                <Input
                  height="50px"
                  bgColor="terang"
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  placeholder="Keterangan (opsional)"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseEditModal}>
                Batal
              </Button>
              <Button colorScheme="blue" onClick={editStokKeluar}>
                Simpan Perubahan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Konfirmasi Hapus */}
        <Modal
          isOpen={isHapusOpen}
          onClose={handleCloseHapusModal}
          isCentered
          size="md"
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
          <ModalContent
            mx={4}
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderRadius="10px"
          >
            <ModalHeader color={colorMode === "dark" ? "white" : "gray.700"}>
              Konfirmasi Hapus
            </ModalHeader>
            <ModalCloseButton
              color={colorMode === "dark" ? "white" : "gray.700"}
            />
            <ModalBody>
              <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                Apakah Anda yakin ingin menghapus data persediaan keluar ini?
                Tindakan ini tidak dapat dibatalkan.
              </Text>
              {keluarToDelete && (
                <Box
                  mt={4}
                  p={4}
                  borderRadius="8px"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Text fontSize="sm" color="gray.500">
                    Barang
                  </Text>
                  <Text fontWeight="semibold" mb={2}>
                    {keluarToDelete.namaPersediaan || "-"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Tujuan
                  </Text>
                  <Text fontWeight="semibold" mb={2}>
                    {keluarToDelete.tujuan || "-"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Jumlah Keluar
                  </Text>
                  <Text fontWeight="semibold" color="red.500">
                    {keluarToDelete.jumlahKeluar}
                  </Text>
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseHapusModal}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={hapusStokKeluar}>
                Ya, Hapus
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </LayoutAset>
    </>
  );
}

export default LaporanPersediaanKeluar;
