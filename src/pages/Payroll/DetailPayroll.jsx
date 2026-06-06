import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  VStack,
  useToast,
  IconButton,
  Badge,
  Input,
} from "@chakra-ui/react";
import { BsPencilFill, BsTrashFill } from "react-icons/bs";
import axios from "axios";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { selectRole } from "../../Redux/Reducers/auth";
import DataKosong from "../../Componets/DataKosong";
import Loading from "../../Componets/Loading";

const formatRupiah = (value) => {
  if (value == null || value === "") return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const normalizeList = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

const formatPeriode = (periode) => {
  if (!periode) return "-";
  const [year, month] = periode.split("-");
  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const m = Number(month);
  if (!year || !m || m < 1 || m > 12) return periode;
  return `${namaBulan[m - 1]} ${year}`;
};

const resolveGajiPokokPayroll = (payroll, gajiPokokPegawai) => {
  if (payroll?.gajiPokok != null && payroll.gajiPokok !== "") {
    return Number(payroll.gajiPokok) || 0;
  }
  return Number(gajiPokokPegawai) || 0;
};

const mapPayrollTunjanganRows = (items) =>
  normalizeList(items).map((item) => ({
    id: item.id,
    nama: item.nama || "-",
    nominal: Number(item.nominal) || 0,
  }));

const mapPayrollPotonganRows = (items) =>
  normalizeList(items).map((item) => ({
    id: item.id,
    nama: item.nama || "-",
    nominal: Number(item.nominal) || 0,
  }));

const isTunjanganLembur = (nama) => /lembur/i.test(nama || "");

const getPayrollTunjangans = (payroll) =>
  normalizeList(
    payroll?.payrollTunjangans ??
      payroll?.payrollTunjangan ??
      payroll?.PayrollTunjangans,
  );

const getPayrollPotongans = (payroll) =>
  normalizeList(
    payroll?.payrollPotongans ??
      payroll?.payrollPotongan ??
      payroll?.PayrollPotongans,
  );

const buildPayrollSlip = (payroll, gajiPokokPegawai, namaPegawai) => {
  const tunjanganRows = mapPayrollTunjanganRows(getPayrollTunjangans(payroll));
  const potonganRows = mapPayrollPotonganRows(getPayrollPotongans(payroll));
  const gajiTetapRows = tunjanganRows.filter((row) => !isTunjanganLembur(row.nama));
  const gajiTidakTetapRows = tunjanganRows.filter((row) =>
    isTunjanganLembur(row.nama),
  );
  const gajiPokokNum = resolveGajiPokokPayroll(payroll, gajiPokokPegawai);
  const totalGajiTetap =
    gajiPokokNum + gajiTetapRows.reduce((sum, row) => sum + row.nominal, 0);
  const totalGajiTidakTetap = gajiTidakTetapRows.reduce(
    (sum, row) => sum + row.nominal,
    0,
  );
  const totalGaji = totalGajiTetap + totalGajiTidakTetap;
  const totalPotongan = potonganRows.reduce((sum, row) => sum + row.nominal, 0);
  const gajiDiterima = totalGaji - totalPotongan;
  const takeHomePay = Math.floor(gajiDiterima / 100) * 100;

  return {
    nama: namaPegawai,
    periode: payroll.periode,
    gajiPokok: gajiPokokNum,
    gajiTetapRows,
    gajiTidakTetapRows,
    totalGajiTetap,
    totalGajiTidakTetap,
    totalGaji,
    potonganRows,
    totalPotongan,
    gajiDiterima,
    takeHomePay,
  };
};

function SlipSectionRow({ title, colSpan }) {
  return (
    <Tr bg="gray.50">
      <Td
        colSpan={colSpan}
        fontWeight="bold"
        fontSize="sm"
        textDecoration="underline"
        py={2}
      >
        {title}
      </Td>
    </Tr>
  );
}

function PayrollSlipTable({ slip, canMutasi, payrollId, onEditTunjangan }) {
  const colSpan = canMutasi ? 4 : 3;

  const renderTunjanganRow = (row) => (
    <Tr key={row.id ?? row.nama}>
      <Td pl={6}>{row.nama}</Td>
      <Td isNumeric>{formatRupiah(row.nominal)}</Td>
      <Td />
      {canMutasi && (
        <Td>
          <IconButton
            aria-label="Edit payroll tunjangan"
            icon={<BsPencilFill />}
            size="xs"
            colorScheme="blue"
            variant="outline"
            onClick={() => onEditTunjangan(row, payrollId)}
          />
        </Td>
      )}
    </Tr>
  );

  const renderPotonganRow = (row) => (
    <Tr key={row.id ?? row.nama}>
      <Td pl={6}>{row.nama}</Td>
      <Td isNumeric>{formatRupiah(row.nominal)}</Td>
      <Td />
      {canMutasi && <Td />}
    </Tr>
  );

  return (
    <Box overflowX="auto" borderRadius="md">
      <Table variant="pegawai" size="sm">
        <Thead>
          <Tr>
            <Th>Uraian</Th>
            <Th isNumeric>Jumlah</Th>
            <Th isNumeric>Total</Th>
            {canMutasi && <Th w="70px">Aksi</Th>}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td fontWeight="semibold">Nama</Td>
            <Td colSpan={canMutasi ? 3 : 2}>{slip.nama || "-"}</Td>
          </Tr>

          <SlipSectionRow title="Gaji Tetap" colSpan={colSpan} />
          <Tr>
            <Td pl={6}>Gaji Pokok</Td>
            <Td isNumeric>{formatRupiah(slip.gajiPokok)}</Td>
            <Td />
            {canMutasi && <Td />}
          </Tr>
          {slip.gajiTetapRows.map(renderTunjanganRow)}
          <Tr fontWeight="bold" bg="gray.50">
            <Td />
            <Td />
            <Td isNumeric>{formatRupiah(slip.totalGajiTetap)}</Td>
            {canMutasi && <Td />}
          </Tr>

          <SlipSectionRow title="Gaji Tidak Tetap" colSpan={colSpan} />
          {slip.gajiTidakTetapRows.length === 0 ? (
            <Tr>
              <Td pl={6} color="gray.500">
                -
              </Td>
              <Td />
              <Td />
              {canMutasi && <Td />}
            </Tr>
          ) : (
            slip.gajiTidakTetapRows.map(renderTunjanganRow)
          )}
          <Tr fontWeight="bold" bg="gray.50">
            <Td />
            <Td />
            <Td isNumeric>{formatRupiah(slip.totalGajiTidakTetap)}</Td>
            {canMutasi && <Td />}
          </Tr>

          <SlipSectionRow title="Potongan" colSpan={colSpan} />
          {slip.potonganRows.length === 0 ? (
            <Tr>
              <Td pl={6} color="gray.500">
                -
              </Td>
              <Td />
              <Td />
              {canMutasi && <Td />}
            </Tr>
          ) : (
            slip.potonganRows.map(renderPotonganRow)
          )}
          <Tr fontWeight="bold" bg="gray.50">
            <Td />
            <Td />
            <Td isNumeric>{formatRupiah(slip.totalPotongan)}</Td>
            {canMutasi && <Td />}
          </Tr>

          <Tr fontWeight="bold" bg="blue.50">
            <Td>Gaji yang Diterima</Td>
            <Td isNumeric>{formatRupiah(slip.gajiDiterima)}</Td>
            <Td isNumeric>{formatRupiah(slip.gajiDiterima)}</Td>
            {canMutasi && <Td />}
          </Tr>
          <Tr fontWeight="bold" bg="green.50">
            <Td>Take Home Pay</Td>
            <Td isNumeric>{formatRupiah(slip.takeHomePay)}</Td>
            <Td isNumeric>{formatRupiah(slip.takeHomePay)}</Td>
            {canMutasi && <Td />}
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

const INFO_PEGAWAI_FIELDS = [
  { key: "nama", label: "Nama" },
  { key: "nip", label: "NIP" },
  { key: "nik", label: "NIK" },
  { key: "gajiPokok", label: "Gaji Pokok", format: formatRupiah },
  { key: "jabatan", label: "Jabatan" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "statusPegawai", label: "Status Pegawai", nested: "status" },
  { key: "profesi", label: "Profesi", nested: "nama" },
  { key: "daftarUnitKerja", label: "Unit Kerja", nested: "unitKerja" },
];

const getPotonganIdFromItem = (item) =>
  item?.potonganId ??
  item?.potongan_id ??
  item?.tunjanganId ??
  item?.tunjangan_id ??
  item?.potongan?.id ??
  item?.Potongan?.id;

const getPotonganListFromResult = (result) =>
  normalizeList(
    result?.pegawaiPotongans ??
      result?.pegawaiPotongan ??
      result?.PegawaiPotongans ??
      [],
  );

const enrichPotonganItems = (items, masters) =>
  normalizeList(items).map((item) => {
    const nested = item?.potongan ?? item?.Potongan;
    if (nested?.nama) return { ...item, potongan: nested };

    const id = getPotonganIdFromItem(item);
    const master = masters.find((m) => String(m.id) === String(id));
    return master
      ? { ...item, potongan: master, potonganId: id ?? master.id }
      : item;
  });

function DetailPayroll(props) {
  const pegawaiId = props.match.params.id;
  const role = useSelector(selectRole);
  const canMutasi = role?.some(
    (r) => (r.roleId ?? r.id) === 7 || (r.roleId ?? r.id) === 5,
  );
  const toast = useToast();

  const [dataRiwayat, setDataRiwayat] = useState(null);
  const { onOpen: onModalMutasiOpen } = useDisclosure();
  const [dataPegawai, setDataPegawai] = useState({
    id: "",
    nama: "",
    jabatan: "",
    nip: "",
    nik: "",
    gajiPokok: "",
    daftarUnitKerja: { id: "", unitKerja: "" },
    pendidikan: "",
    profesi: { id: "", nama: "" },
    statusPegawai: { id: "", status: "" },
  });

  const [masterTunjangan, setMasterTunjangan] = useState([]);
  const [masterPotongan, setMasterPotongan] = useState([]);
  const [dataPayrolls, setDataPayrolls] = useState([]);
  const [dataTunjanganPegawai, setDataTunjanganPegawai] = useState([]);
  const [rawPotonganPegawai, setRawPotonganPegawai] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPayrollTunjangan, setIsSubmittingPayrollTunjangan] =
    useState(false);
  const [formTunjangan, setFormTunjangan] = useState({
    tunjanganId: "",
    nominal: "",
  });
  const [formPayrollTunjangan, setFormPayrollTunjangan] = useState({
    id: "",
    payrollId: "",
    nama: "",
    nominal: "",
  });
  const [formPotongan, setFormPotongan] = useState({ potonganId: "" });
  const [editTunjanganId, setEditTunjanganId] = useState(null);
  const [selectedHapusTunjanganId, setSelectedHapusTunjanganId] =
    useState(null);

  const {
    isOpen: isTunjanganOpen,
    onOpen: onTunjanganOpen,
    onClose: onTunjanganClose,
  } = useDisclosure();
  const {
    isOpen: isHapusTunjanganOpen,
    onOpen: onHapusTunjanganOpen,
    onClose: onHapusTunjanganClose,
  } = useDisclosure();
  const {
    isOpen: isPotonganOpen,
    onOpen: onPotonganOpen,
    onClose: onPotonganClose,
  } = useDisclosure();
  const {
    isOpen: isPayrollTunjanganOpen,
    onOpen: onPayrollTunjanganOpen,
    onClose: onPayrollTunjanganClose,
  } = useDisclosure();

  function openTambahTunjangan() {
    setEditTunjanganId(null);
    setFormTunjangan({ tunjanganId: "", nominal: "" });
    onTunjanganOpen();
  }

  function openEditTunjangan(item) {
    setEditTunjanganId(item.id);
    setFormTunjangan({
      tunjanganId: String(item.tunjanganId ?? item.tunjangan?.id ?? ""),
      nominal: item.nominal ?? "",
    });
    onTunjanganOpen();
  }

  function closeTunjanganModal() {
    setEditTunjanganId(null);
    setFormTunjangan({ tunjanganId: "", nominal: "" });
    onTunjanganClose();
  }

  function openHapusTunjangan(id) {
    setSelectedHapusTunjanganId(id);
    onHapusTunjanganOpen();
  }

  function openEditPayrollTunjangan(item, payrollId) {
    setFormPayrollTunjangan({
      id: item?.id ?? "",
      payrollId: payrollId ?? "",
      nama: item?.nama ?? "",
      nominal: Number(item?.nominal) || 0,
    });
    onPayrollTunjanganOpen();
  }

  function closeEditPayrollTunjanganModal() {
    setFormPayrollTunjangan({ id: "", payrollId: "", nama: "", nominal: "" });
    onPayrollTunjanganClose();
  }

  async function fetchDataPengaturan() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/payroll/get/pengaturan`,
      );
      setMasterPotongan(res?.data?.resultPotongan || []);
      setMasterTunjangan(res?.data?.resultTunjangan || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat data pengaturan",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  }

  async function fetchDataPegawai() {
    setIsLoadingData(true);
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/get/detail-payroll/${pegawaiId}`,
      );
      const result = res?.data?.result;
      if (!result) return;
      setDataPayrolls(normalizeList(result.payrolls));
      setDataPegawai({
        id: result.id,
        nama: result.nama,
        jabatan: result.jabatan,
        nip: result.nip,
        nik: result.nik,
        gajiPokok: result.gajiPokok,
        pendidikan: result.pendidikan,
        profesi: {
          id: result.profesi?.id,
          nama: result.profesi?.nama,
        },
        statusPegawai: {
          id: result.statusPegawai?.id,
          status: result.statusPegawai?.status,
        },
        daftarUnitKerja: {
          id: result.daftarUnitKerja?.id,
          unitKerja: result.daftarUnitKerja?.unitKerja,
        },
      });
      setDataTunjanganPegawai(
        normalizeList(result.pegawaiTunjangans ?? result.pegawaiTunjangan),
      );
      setRawPotonganPegawai(getPotonganListFromResult(result));
      if (result.riwayat) setDataRiwayat(result.riwayat);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal memuat data detail payroll",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    fetchDataPengaturan();
    fetchDataPegawai();
  }, [pegawaiId]);

  const dataPotonganPegawai = useMemo(
    () => enrichPotonganItems(rawPotonganPegawai, masterPotongan),
    [rawPotonganPegawai, masterPotongan],
  );

  function handleSubmitTunjangan() {
    if (!formTunjangan.tunjanganId || formTunjangan.nominal === "") {
      toast({
        title: "Error",
        description: "Pilih tunjangan dan isi nominal",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const body = {
      tunjanganId: formTunjangan.tunjanganId,
      nominal: Number(formTunjangan.nominal),
    };
    const url = editTunjanganId
      ? `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/put/edit-tunjangan/${editTunjanganId}`
      : `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/post/tambah-tunjangan`;
    const payload = editTunjanganId
      ? body
      : { ...body, pegawaiId: dataPegawai.id || pegawaiId };

    setIsSubmitting(true);
    axios
      .post(url, payload)
      .then(() => {
        toast({
          title: "Berhasil",
          description: editTunjanganId
            ? "Tunjangan berhasil diubah"
            : "Tunjangan berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        closeTunjanganModal();
        fetchDataPegawai();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message ||
            (editTunjanganId
              ? "Gagal mengubah tunjangan"
              : "Gagal menambahkan tunjangan"),
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function hapusTunjangan(id) {
    setIsSubmitting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/delete/tunjangan/${id}`,
      )
      .then(() => {
        toast({
          title: "Berhasil",
          description: "Tunjangan berhasil dihapus",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onHapusTunjanganClose();
        setSelectedHapusTunjanganId(null);
        fetchDataPegawai();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Gagal menghapus tunjangan",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleSubmitPotongan() {
    if (!formPotongan.potonganId) {
      toast({
        title: "Error",
        description: "Pilih potongan",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmitting(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/post/tambah-potongan`,
        {
          pegawaiId: dataPegawai.id || pegawaiId,
          potonganId: formPotongan.potonganId,
        },
      )
      .then(() => {
        toast({
          title: "Berhasil",
          description: "Potongan berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setFormPotongan({ potonganId: "" });
        onPotonganClose();
        fetchDataPegawai();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Gagal menambahkan potongan",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleSubmitPayrollTunjangan() {
    if (!formPayrollTunjangan.id || !formPayrollTunjangan.nama.trim()) {
      toast({
        title: "Error",
        description: "Nama tunjangan payroll wajib diisi",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsSubmittingPayrollTunjangan(true);
    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/payroll/put/edit-payroll-tunjangan/${formPayrollTunjangan.id}`,
        {
          payrollId: formPayrollTunjangan.payrollId,
          nama: formPayrollTunjangan.nama.trim(),
          nominal: Number(formPayrollTunjangan.nominal) || 0,
        },
      )
      .then(() => {
        toast({
          title: "Berhasil",
          description: "Payroll tunjangan berhasil diubah",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        closeEditPayrollTunjanganModal();
        fetchDataPegawai();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Gagal mengubah payroll tunjangan",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      })
      .finally(() => setIsSubmittingPayrollTunjangan(false));
  }

  const getTunjanganNama = (item) => item.tunjangan?.nama || item.nama || "-";

  const getPotonganNama = (item) => {
    const nested = item?.potongan ?? item?.Potongan;
    if (nested?.nama) return nested.nama;
    const id = getPotonganIdFromItem(item);
    const master = masterPotongan.find((p) => String(p.id) === String(id));
    return master?.nama || item?.nama || "-";
  };

  const getInfoPegawaiValue = (field) => {
    const raw = dataPegawai[field.key];
    if (field.format) return field.format(raw);
    if (field.nested) return raw?.[field.nested] || "-";
    return raw || "-";
  };

  return (
    <LayoutPegawai>
      {isLoadingData && <Loading />}
      <Box bgColor={"secondary"} py={"60px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} pt={"30px"} ps={"0px"}>
          <Box p={"30px"}>
            <Heading size="md" mb={4}>
              Informasi Pegawai
            </Heading>
            <Box overflowX="auto" borderRadius="md">
              <Table variant="pegawai" size="sm">
                <Tbody>
                  {INFO_PEGAWAI_FIELDS.map((field) => (
                    <Tr key={field.key}>
                      <Th w="200px" whiteSpace="nowrap">
                        {field.label}
                      </Th>
                      <Td>{getInfoPegawaiValue(field)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {canMutasi && (
              <Box mt={"30px"}>
                <HStack spacing={"15px"}></HStack>
              </Box>
            )}
          </Box>
        </Container>

        <Container
          mt={"30px"}
          maxW={"1280px"}
          variant={"primary"}
          pt={"30px"}
          ps={"0px"}
        >
          <Box p={"30px"}>
            <Heading size="md" mb={4}>
              Data Payroll
            </Heading>
            {dataPayrolls.length === 0 ? (
              <DataKosong message="Belum ada data payroll untuk pegawai ini" />
            ) : (
              <VStack align="stretch" spacing={8}>
                {dataPayrolls.map((payroll) => {
                  const slip = buildPayrollSlip(
                    payroll,
                    dataPegawai.gajiPokok,
                    dataPegawai.nama,
                  );
                  return (
                    <Box
                      key={payroll.id}
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        mb={4}
                        wrap="wrap"
                        gap={2}
                      >
                        <HStack>
                          <Text fontWeight="bold">Periode:</Text>
                          <Badge colorScheme="blue" fontSize="sm">
                            {formatPeriode(payroll.periode)}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {payroll.createdAt
                            ? new Date(payroll.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : ""}
                        </Text>
                      </Flex>
                      <PayrollSlipTable
                        slip={slip}
                        canMutasi={canMutasi}
                        payrollId={payroll.id}
                        onEditTunjangan={openEditPayrollTunjangan}
                      />
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </Container>

        <Container
          mt={"30px"}
          maxW={"1280px"}
          variant={"primary"}
          pt={"30px"}
          ps={"0px"}
        >
          <Box p={"30px"}>
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              wrap="wrap"
              gap={3}
            >
              <Heading size="md">Tunjangan Pegawai</Heading>
              {canMutasi && (
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={openTambahTunjangan}
                >
                  Tambah Tunjangan
                </Button>
              )}
            </Flex>
            {dataTunjanganPegawai.length === 0 ? (
              <DataKosong message="Belum ada tunjangan untuk pegawai ini" />
            ) : (
              <Box overflowX="auto" borderRadius="md">
                <Table variant={"pegawai"} size="sm">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Nama Tunjangan</Th>
                    <Th isNumeric>Nominal</Th>
                    {canMutasi && <Th>Aksi</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {dataTunjanganPegawai.map((item, index) => (
                    <Tr key={item.id ?? index}>
                      <Td>{index + 1}</Td>
                      <Td>{getTunjanganNama(item)}</Td>
                      <Td isNumeric>{formatRupiah(item.nominal)}</Td>
                      {canMutasi && (
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit tunjangan"
                              icon={<BsPencilFill />}
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => openEditTunjangan(item)}
                            />
                            <IconButton
                              aria-label="Hapus tunjangan"
                              icon={<BsTrashFill />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => openHapusTunjangan(item.id)}
                            />
                          </HStack>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              </Box>
            )}
          </Box>
        </Container>

        <Container
          mt={"30px"}
          maxW={"1280px"}
          variant={"primary"}
          pt={"30px"}
          ps={"0px"}
        >
          <Box p={"30px"}>
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              wrap="wrap"
              gap={3}
            >
              <Heading size="md">Potongan Pegawai</Heading>
              {canMutasi && (
                <Button colorScheme="red" size="sm" onClick={onPotonganOpen}>
                  Tambah Potongan
                </Button>
              )}
            </Flex>
            {dataPotonganPegawai.length === 0 ? (
              <DataKosong message="Belum ada potongan untuk pegawai ini" />
            ) : (
              <Box overflowX="auto" borderRadius="md">
                <Table variant={"pegawai"} size="sm">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    <Th>Nama Potongan</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dataPotonganPegawai.map((item, index) => (
                    <Tr key={item.id ?? index}>
                      <Td>{index + 1}</Td>
                      <Td>{getPotonganNama(item)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              </Box>
            )}
          </Box>
        </Container>

        {dataRiwayat?.length > 0 && (
          <Container
            mt={"30px"}
            maxW={"1280px"}
            variant={"primary"}
            pt={"30px"}
            ps={"0px"}
          >
            <Box p={"30px"}>
              <Heading size="md" mb={4}>
                Riwayat Pegawai
              </Heading>
              <Box overflowX="auto" borderRadius="md">
                <Table variant="pegawai" size="sm">
                  <Thead>
                    <Tr>
                      <Th>No</Th>
                      <Th>Tanggal</Th>
                      <Th>Unit Kerja Lama</Th>
                      <Th>Profesi Lama</Th>
                      <Th>Keterangan</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dataRiwayat.map((item, index) => (
                      <Tr key={item.id ?? index}>
                        <Td>{index + 1}</Td>
                        <Td>
                          {item?.tanggal
                            ? new Date(item.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </Td>
                        <Td>{item?.unitKerjaLama?.unitKerja || "-"}</Td>
                        <Td>{item?.profesiLama?.nama || "-"}</Td>
                        <Td>{item?.keterangan || "-"}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Container>
        )}
      </Box>

      <Modal
        isOpen={isTunjanganOpen}
        onClose={closeTunjanganModal}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editTunjanganId ? "Edit Tunjangan" : "Tambah Tunjangan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Tunjangan</FormLabel>
                <Select
                  placeholder="Pilih tunjangan"
                  value={formTunjangan.tunjanganId}
                  onChange={(e) =>
                    setFormTunjangan((prev) => ({
                      ...prev,
                      tunjanganId: e.target.value,
                    }))
                  }
                >
                  {masterTunjangan.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.nama}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nominal (Rp)</FormLabel>
                <NumberInput
                  min={0}
                  value={formTunjangan.nominal}
                  onChange={(_, val) =>
                    setFormTunjangan((prev) => ({ ...prev, nominal: val }))
                  }
                >
                  <NumberInputField placeholder="Contoh: 500000" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={closeTunjanganModal}>
              Batal
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitTunjangan}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPayrollTunjanganOpen}
        onClose={closeEditPayrollTunjanganModal}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Payroll Tunjangan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Nama</FormLabel>
                <Input
                  value={formPayrollTunjangan.nama}
                  onChange={(e) =>
                    setFormPayrollTunjangan((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                  placeholder="Nama tunjangan"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nominal (Rp)</FormLabel>
                <NumberInput
                  min={0}
                  value={formPayrollTunjangan.nominal}
                  onChange={(_, val) =>
                    setFormPayrollTunjangan((prev) => ({
                      ...prev,
                      nominal: val,
                    }))
                  }
                >
                  <NumberInputField placeholder="Contoh: 500000" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={closeEditPayrollTunjanganModal}
            >
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitPayrollTunjangan}
              isLoading={isSubmittingPayrollTunjangan}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isHapusTunjanganOpen}
        onClose={onHapusTunjanganClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Apakah Anda yakin ingin menghapus tunjangan ini? Tindakan ini
              tidak dapat dibatalkan.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onHapusTunjanganClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              isLoading={isSubmitting}
              onClick={() => hapusTunjangan(selectedHapusTunjanganId)}
            >
              Ya, Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPotonganOpen}
        onClose={onPotonganClose}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tambah Potongan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Potongan</FormLabel>
                <Select
                  placeholder="Pilih potongan"
                  value={formPotongan.potonganId}
                  onChange={(e) =>
                    setFormPotongan((prev) => ({
                      ...prev,
                      potonganId: e.target.value,
                    }))
                  }
                >
                  {masterPotongan.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.nama}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onPotonganClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmitPotongan}
              isLoading={isSubmitting}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutPegawai>
  );
}

export default DetailPayroll;
