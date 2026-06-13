import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAset from "../../Componets/Aset/LayoutAset";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Badge,
  useToast,
  useColorMode,
  useDisclosure,
  Textarea,
  Spacer,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { BsTrash } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

const FILTER_ALL = "all";

function MutasiPersediaan() {
  const [mutasiList, setMutasiList] = useState([]);
  const [stokList, setStokList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [filterUnitKerjaId, setFilterUnitKerjaId] = useState(null);
  const [selectedStok, setSelectedStok] = useState(null);
  const [unitKerjaTujuanId, setUnitKerjaTujuanId] = useState(null);
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [mutasiToCancel, setMutasiToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const user = useSelector(userRedux);
  const userUnitKerjaId = user[0]?.unitKerja_profile?.id;
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  const fetchMutasiList = async (unitKerjaIdParam) => {
    const id = unitKerjaIdParam ?? filterUnitKerjaId;
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/get/list/${id}`
      );
      setMutasiList(res.data.result || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat data mutasi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStokModal = async () => {
    try {
      const [stokRes, ukRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/get/stok`
        ),
        unitKerjaList.length
          ? Promise.resolve({ data: { result: unitKerjaList } })
          : axios.get(
              `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
            ),
      ]);
      setStokList(stokRes.data.result || []);
      if (!unitKerjaList.length) {
        setUnitKerjaList(ukRes.data.result || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Gagal memuat daftar stok",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const fetchUnitKerjaList = async () => {
    try {
      const ukRes = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
      );
      setUnitKerjaList(ukRes.data.result || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnitKerjaList();
    if (userUnitKerjaId) {
      setFilterUnitKerjaId(userUnitKerjaId);
    }
  }, []);

  useEffect(() => {
    if (filterUnitKerjaId) {
      fetchMutasiList(filterUnitKerjaId);
    }
  }, [filterUnitKerjaId]);

  const handleOpenModal = () => {
    resetForm();
    fetchStokModal();
    onOpen();
  };

  const resetForm = () => {
    setSelectedStok(null);
    setUnitKerjaTujuanId(null);
    setJumlah("");
    setTanggal("");
    setKeterangan("");
  };

  const handleSubmit = async () => {
    if (!selectedStok || !unitKerjaTujuanId || !jumlah || !tanggal) {
      toast({
        title: "Error",
        description: "Lengkapi semua field wajib",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (Number(jumlah) > selectedStok.sisaStok) {
      toast({
        title: "Error",
        description: `Maksimal ${selectedStok.sisaStok} unit`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/post`,
        {
          stokMasukAsalId: selectedStok.id,
          unitKerjaTujuanId,
          jumlah: Number(jumlah),
          tanggal,
          keterangan,
        }
      );
      toast({
        title: "Berhasil",
        description: "Mutasi persediaan berhasil disimpan",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      resetForm();
      onClose();
      fetchMutasiList();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal menyimpan mutasi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openCancelModal = (mutasi) => {
    setMutasiToCancel(mutasi);
    onCancelOpen();
  };

  const handleCloseCancelModal = () => {
    onCancelClose();
    setMutasiToCancel(null);
  };

  const handleBatalkanMutasi = async () => {
    if (!mutasiToCancel?.id) return;

    setCancelling(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/delete/${mutasiToCancel.id}`
      );
      toast({
        title: "Berhasil",
        description:
          "Mutasi dibatalkan. Stok unit asal dan tujuan telah dikembalikan.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      handleCloseCancelModal();
      fetchMutasiList();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Gagal membatalkan mutasi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("id-ID") : "-";

  const getMutasiBarangNama = (m) =>
    m.stokMasukAsal?.persediaan?.nama ||
    m.stokMasukTujuan?.persediaan?.nama ||
    "-";

  const getUnitKerjaLabel = (stok) =>
    stok?.daftarUnitKerja?.unitKerja ||
    stok?.daftarUnitKerja?.kode ||
    unitKerjaList.find((u) => u.id === stok?.unitKerjaId)?.unitKerja ||
    "-";

  const stokOptions = stokList.map((s) => ({
    value: s.id,
    label: `[${getUnitKerjaLabel(s)}] ${s.persediaan?.nama || "-"} | Sisa: ${s.sisaStok}${s.spesifikasi ? ` | ${s.spesifikasi}` : ""}`,
    data: s,
  }));

  const asalUnitKerjaId = selectedStok?.unitKerjaId ?? null;

  const unitOptions = unitKerjaList
    .filter((u) => Number(u.id) !== Number(asalUnitKerjaId))
    .map((u) => ({
      value: u.id,
      label: u.unitKerja || u.kode,
    }));

  const unitKerjaFilterOptions = [
    { value: FILTER_ALL, label: "Semua Unit Kerja" },
    ...(unitKerjaList?.map((val) => ({
      value: val.id,
      label: val.unitKerja || val.kode,
    })) || []),
  ];

  const showArahColumn = filterUnitKerjaId !== FILTER_ALL;
  const colSpan = (showArahColumn ? 7 : 6) + 1;

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
              Mutasi Persediaan
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
            <Button variant="primary" onClick={handleOpenModal}>
              Mutasi Baru +
            </Button>
          </HStack>

          <Table variant="aset">
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th>Barang</Th>
                <Th isNumeric>Jumlah</Th>
                <Th>Unit Asal</Th>
                <Th>Unit Tujuan</Th>
                <Th>Status</Th>
                {showArahColumn && <Th>Arah</Th>}
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
              ) : mutasiList.length === 0 ? (
                <Tr>
                  <Td colSpan={colSpan} textAlign="center">
                    Belum ada mutasi
                  </Td>
                </Tr>
              ) : (
                mutasiList.map((m) => {
                  const isAsal =
                    Number(m.unitKerjaAsalId) === Number(filterUnitKerjaId);
                  return (
                    <Tr key={m.id}>
                      <Td>{formatDate(m.tanggal)}</Td>
                      <Td>{getMutasiBarangNama(m)}</Td>
                      <Td isNumeric>{m.jumlah}</Td>
                      <Td>{m.unitKerjaAsal?.unitKerja || "-"}</Td>
                      <Td>{m.unitKerjaTujuan?.unitKerja || "-"}</Td>
                      <Td>
                        <Badge colorScheme="green">{m.status}</Badge>
                      </Td>
                      {showArahColumn && (
                        <Td>
                          <Badge colorScheme={isAsal ? "orange" : "blue"}>
                            {isAsal ? "Keluar" : "Masuk"}
                          </Badge>
                        </Td>
                      )}
                      <Td>
                        {m.status === "selesai" && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<BsTrash />}
                            onClick={() => openCancelModal(m)}
                          >
                            Batalkan
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal
        isOpen={isCancelOpen}
        onClose={handleCloseCancelModal}
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
            Batalkan Mutasi
          </ModalHeader>
          <ModalCloseButton
            color={colorMode === "dark" ? "white" : "gray.700"}
          />
          <ModalBody>
            <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
              Mutasi ini akan dihapus dan stok dikembalikan seperti sebelum
              mutasi dilakukan. Stok keluar di unit asal dihapus, stok masuk di
              unit tujuan dihapus.
            </Text>
            {mutasiToCancel && (
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
                  {getMutasiBarangNama(mutasiToCancel)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Unit Asal → Tujuan
                </Text>
                <Text fontWeight="semibold" mb={2}>
                  {mutasiToCancel.unitKerjaAsal?.unitKerja || "-"} →{" "}
                  {mutasiToCancel.unitKerjaTujuan?.unitKerja || "-"}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Jumlah
                </Text>
                <Text fontWeight="semibold" color="red.500">
                  {mutasiToCancel.jumlah}
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseCancelModal}>
              Tutup
            </Button>
            <Button
              colorScheme="red"
              onClick={handleBatalkanMutasi}
              isLoading={cancelling}
            >
              Ya, Batalkan Mutasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mutasi Barang Antar Unit Kerja</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Barang / Batch Stok</FormLabel>
              <Select2
                options={stokOptions}
                placeholder="Pilih barang dengan sisa stok"
                value={
                  selectedStok
                    ? stokOptions.find((opt) => opt.value === selectedStok.id) ||
                      null
                    : null
                }
                onChange={(opt) => {
                  const data = opt?.data || null;
                  setSelectedStok(data);
                  setJumlah("");
                  if (
                    data &&
                    Number(unitKerjaTujuanId) === Number(data.unitKerjaId)
                  ) {
                    setUnitKerjaTujuanId(null);
                  }
                }}
                chakraStyles={{
                  control: (p) => ({ ...p, bg: "terang", minH: "48px" }),
                }}
              />
            </FormControl>

            {selectedStok && (
              <Text fontSize="sm" color="gray.500" mb={4}>
                Unit asal: <strong>{getUnitKerjaLabel(selectedStok)}</strong>
                {" · "}
                Sisa stok tersedia: <strong>{selectedStok.sisaStok}</strong>
              </Text>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>Unit Kerja Tujuan</FormLabel>
              <Select2
                options={unitOptions}
                placeholder={
                  selectedStok
                    ? "Pilih unit kerja tujuan"
                    : "Pilih barang terlebih dahulu"
                }
                isDisabled={!selectedStok}
                value={
                  unitKerjaTujuanId
                    ? unitOptions.find((opt) => opt.value === unitKerjaTujuanId) ||
                      null
                    : null
                }
                onChange={(opt) => setUnitKerjaTujuanId(opt?.value || null)}
                chakraStyles={{
                  control: (p) => ({ ...p, bg: "terang", minH: "48px" }),
                }}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Jumlah</FormLabel>
              <Input
                type="number"
                min={1}
                max={selectedStok?.sisaStok || undefined}
                bg="terang"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Tanggal</FormLabel>
              <Input
                type="date"
                bg="terang"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </FormControl>

            <FormControl mb={2}>
              <FormLabel>Keterangan</FormLabel>
              <Textarea
                bg="terang"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Opsional"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Simpan Mutasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LayoutAset>
  );
}

export default MutasiPersediaan;
