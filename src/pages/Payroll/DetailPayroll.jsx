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
  Divider,
  Grid,
  GridItem,
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

const formatAngka = (value) => {
  const num = Number(value);
  if (value == null || value === "" || Number.isNaN(num) || num === 0)
    return "-";
  return new Intl.NumberFormat("id-ID").format(num);
};

const TUNJANGAN_TETAP_SLOTS = [
  { label: "Tunj. Transport", match: /transport/i },
  { label: "Tunj. Makan", match: /makan/i },
  { label: "Tunj. Keluarga", match: /keluarga/i },
  { label: "Tunj. Jabatan", match: /jabatan/i },
  { label: "Tunj Lain", match: null },
];

const POTONGAN_SLOTS = [
  { label: "Bpjs TK", match: /bpjs\s*tk|jht|ketenagakerjaan/i },
  { label: "Bpjs Kes", match: /bpjs\s*kes|kesehatan/i },
  { label: "PPh 21", match: /pph|pajak/i },
  { label: "Pot. Lain-Lain", match: /lain/i },
];

const isLembur = (nama) => /lembur/i.test(nama || "");

const mapTunjanganTetapRows = (items) => {
  const list = normalizeList(items).filter((i) => !isLembur(i.nama));
  const usedIds = new Set();
  const rows = TUNJANGAN_TETAP_SLOTS.map((slot) => {
    let found = null;
    if (slot.match) {
      found = list.find(
        (i) => slot.match.test(i.nama || "") && !usedIds.has(i.id),
      );
    }
    if (found) usedIds.add(found.id);
    return { label: slot.label, nominal: found ? Number(found.nominal) : null };
  });
  const unmatched = list.filter((i) => !usedIds.has(i.id));
  if (unmatched.length) {
    const lainSum = unmatched.reduce((s, i) => s + Number(i.nominal || 0), 0);
    const lainIdx = rows.findIndex((r) => r.label === "Tunj Lain");
    if (lainIdx >= 0) {
      rows[lainIdx].nominal = (rows[lainIdx].nominal || 0) + lainSum;
    }
  }
  return rows;
};

const mapPotonganRows = (items) => {
  const list = normalizeList(items);
  const usedIds = new Set();
  const rows = POTONGAN_SLOTS.map((slot) => {
    let found = null;
    if (slot.match) {
      found = list.find(
        (i) => slot.match.test(i.nama || "") && !usedIds.has(i.id),
      );
    }
    if (found) usedIds.add(found.id);
    return {
      label: slot.label,
      nominal: found ? Number(found.nominal) || 0 : null,
    };
  });
  const unmatched = list.filter((i) => !usedIds.has(i.id));
  if (unmatched.length) {
    const lainSum = unmatched.reduce((s, i) => s + (Number(i.nominal) || 0), 0);
    const lainIdx = rows.findIndex((r) => r.label === "Pot. Lain-Lain");
    if (lainIdx >= 0) {
      rows[lainIdx].nominal = (rows[lainIdx].nominal || 0) + lainSum;
    }
  }
  return rows;
};

const resolveGajiPokokPayroll = (payroll, gajiPokokPegawai) => {
  if (payroll?.gajiPokok != null && payroll.gajiPokok !== "") {
    return Number(payroll.gajiPokok) || 0;
  }
  return Number(gajiPokokPegawai) || 0;
};

const buildPayrollSlip = (payroll, gajiPokokPegawai, namaPegawai) => {
  const tunjanganList = normalizeList(payroll.payrollTunjangans);
  const lemburItem = tunjanganList.find((t) => isLembur(t.nama));
  const tunjanganTetapRows = mapTunjanganTetapRows(tunjanganList);
  const gajiPokokNum = resolveGajiPokokPayroll(payroll, gajiPokokPegawai);
  const subtotalTetap =
    gajiPokokNum +
    tunjanganTetapRows.reduce((s, r) => s + (Number(r.nominal) || 0), 0);
  const lemburNominal = lemburItem ? Number(lemburItem.nominal) : null;
  const totalGaji = subtotalTetap + (lemburNominal || 0);
  const potonganRows = mapPotonganRows(payroll.payrollPotongans);
  const totalPotongan = potonganRows.reduce(
    (s, r) => s + (Number(r.nominal) || 0),
    0,
  );
  const gajiDiterima = totalGaji - totalPotongan;
  const takeHomePay = Math.floor(gajiDiterima / 100) * 100;

  return {
    nama: namaPegawai,
    periode: payroll.periode,
    gajiPokok: gajiPokokNum,
    tunjanganTetapRows,
    subtotalTetap,
    lemburNominal,
    totalGaji,
    potonganRows,
    totalPotongan,
    gajiDiterima,
    takeHomePay,
  };
};

function SlipSection({ title }) {
  return (
    <Box px={3} pt={2} pb={0}>
      <Text fontWeight="bold" textDecoration="underline" fontSize="sm">
        {title}
      </Text>
    </Box>
  );
}

function SlipRow({ label, value, total, isBold, isNama }) {
  const col2 = isNama ? value : formatAngka(value);
  const col3 =
    total != null && total !== "" ? (isNama ? "" : formatAngka(total)) : "";

  return (
    <Grid
      templateColumns="1fr 130px 130px"
      px={3}
      py={isNama ? 2 : 1}
      gap={2}
      alignItems="center"
      minH={isNama ? "36px" : "28px"}
    >
      <GridItem>
        <Text fontWeight={isBold ? "bold" : "normal"} fontSize="sm">
          {label}
        </Text>
      </GridItem>
      <GridItem>
        <Text
          textAlign="right"
          fontSize="sm"
          fontWeight={isNama ? "semibold" : "normal"}
        >
          {col2}
        </Text>
      </GridItem>
      <GridItem>
        <Text
          textAlign="right"
          fontSize="sm"
          fontWeight={isBold ? "bold" : "normal"}
        >
          {col3}
        </Text>
      </GridItem>
    </Grid>
  );
}

function PayrollSlip({ slip }) {
  return (
    <Box
      border="2px solid"
      borderColor="gray.800"
      maxW="480px"
      bg="white"
      color="gray.900"
      overflow="hidden"
    >
      <SlipRow label="Nama" value={slip.nama} isNama />
      <Box h="2px" bg="gray.800" />

      <SlipSection title="Gaji Tetap" />
      <SlipRow label="Gaji Pokok" value={slip.gajiPokok} />
      {slip.tunjanganTetapRows.map((row) => (
        <SlipRow key={row.label} label={row.label} value={row.nominal} />
      ))}
      <SlipRow label="" value={null} total={slip.subtotalTetap} />

      <SlipSection title="Gaji Tidak Tetap" />
      <SlipRow label="Lembur" value={slip.lemburNominal} />
      <SlipRow label="" value={null} total={slip.totalGaji} />

      <Box h="2px" bg="gray.800" my={1} />

      <SlipSection title="Potongan" />
      {slip.potonganRows.map((row) => (
        <SlipRow key={row.label} label={row.label} value={row.nominal} />
      ))}
      <SlipRow label="" value={null} total={slip.totalPotongan} />

      <Box h="2px" bg="gray.800" my={1} />

      <SlipRow
        label="Gaji yang Diterima"
        value={slip.gajiDiterima}
        total={slip.gajiDiterima}
        isBold
      />
      <SlipRow
        label="Take Home Pay"
        value={slip.takeHomePay}
        total={slip.takeHomePay}
        isBold
      />
    </Box>
  );
}

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
      console.log(result);
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

  return (
    <LayoutPegawai>
      {isLoadingData && <Loading />}
      <Box bgColor={"secondary"} py={"60px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} pt={"30px"} ps={"0px"}>
          <Box p={"30px"}>
            <Table>
              <Thead>
                <Tr>
                  <Th minWidth={"100px"}>Nama:</Th>
                  <Td>
                    <Flex>
                      <Text as="span">{dataPegawai.nama}</Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th minWidth={"100px"}>NIP</Th>
                  <Td>
                    <Flex>
                      <Text as="span">{dataPegawai.nip}</Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th minWidth={"100px"}>NIK</Th>
                  <Td>
                    <Flex>
                      <Text as="span">{dataPegawai.nik}</Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th minWidth={"100px"}>Gaji Pokok</Th>
                  <Td>
                    <Flex>
                      <Text as="span">
                        {formatRupiah(dataPegawai.gajiPokok)}
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th minWidth={"100px"}>Jabatan</Th>
                  <Td>
                    <Flex>
                      <Text as="span">{dataPegawai.jabatan}</Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th minWidth={"100px"}>Pendidikan</Th>
                  <Td>
                    <Flex>
                      <Text as="span">{dataPegawai.pendidikan}</Text>
                    </Flex>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Status Pegawai</Th>
                  <Td>
                    <Text>{dataPegawai.statusPegawai?.status}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Profesi</Th>
                  <Td>
                    <Text>{dataPegawai.profesi?.nama}</Text>
                  </Td>
                </Tr>
                <Tr>
                  <Th>Unit Kerja</Th>
                  <Td>
                    <Text>{dataPegawai.daftarUnitKerja?.unitKerja || "-"}</Text>
                  </Td>
                </Tr>
              </Thead>
            </Table>
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
                  const payrollTunjanganItems = normalizeList(
                    payroll.payrollTunjangans,
                  );
                  return (
                    <Box key={payroll.id}>
                      <Flex
                        justify="space-between"
                        align="center"
                        mb={3}
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
                              )
                            : ""}
                        </Text>
                      </Flex>
                      <PayrollSlip slip={slip} />
                      <Box mt={4}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontWeight="semibold">Payroll Tunjangan</Text>
                        </Flex>
                        {payrollTunjanganItems.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">
                            Tidak ada payroll tunjangan pada periode ini
                          </Text>
                        ) : (
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Nama</Th>
                                <Th isNumeric>Nominal</Th>
                                {canMutasi && <Th>Aksi</Th>}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {payrollTunjanganItems.map((item, idx) => (
                                <Tr key={item.id ?? idx}>
                                  <Td>{item.nama || "-"}</Td>
                                  <Td isNumeric>
                                    {formatRupiah(item.nominal)}
                                  </Td>
                                  {canMutasi && (
                                    <Td>
                                      <IconButton
                                        aria-label="Edit payroll tunjangan"
                                        icon={<BsPencilFill />}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={() =>
                                          openEditPayrollTunjangan(
                                            item,
                                            payroll.id,
                                          )
                                        }
                                      />
                                    </Td>
                                  )}
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        )}
                      </Box>
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
              <Table variant={"pegawai"}>
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
              <Table variant={"pegawai"}>
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
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Nama</Th>
                <Th>Unit Kerja</Th>
                <Th>Status</Th>
                <Th>Aksi</Th> <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataRiwayat?.map((item, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{dataPegawai.nama}</Td>
                  <Td>{item?.unitKerjaLama?.unitKerja}</Td>
                  <Td>{item?.profesiLama?.nama}</Td>{" "}
                  <Td>
                    {item?.pangkat?.pangkat}/{item?.golongan?.golongan}
                  </Td>
                  <Td>{JSON.stringify(item?.golongan?.golongan)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Container>
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
