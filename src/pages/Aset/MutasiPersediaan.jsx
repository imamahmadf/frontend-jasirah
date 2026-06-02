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
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { useSelector } from "react-redux";
import { userRedux } from "../../Redux/Reducers/auth";

function MutasiPersediaan() {
  const [mutasiList, setMutasiList] = useState([]);
  const [stokList, setStokList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedStok, setSelectedStok] = useState(null);
  const [unitKerjaTujuanId, setUnitKerjaTujuanId] = useState(null);
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useSelector(userRedux);
  const unitKerjaId = user[0]?.unitKerja_profile?.id;
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchData = async () => {
    if (!unitKerjaId) return;
    setLoading(true);
    try {
      const [mutasiRes, stokRes, ukRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/get/list/${unitKerjaId}`
        ),
        axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/mutasi-persediaan/get/stok/${unitKerjaId}`
        ),
        axios.get(
          `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/admin/get/unit-kerja`
        ),
      ]);
      setMutasiList(mutasiRes.data.result || []);
      setStokList(stokRes.data.result || []);
      setUnitKerjaList(ukRes.data.result || []);
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

  useEffect(() => {
    fetchData();
  }, [unitKerjaId]);

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
      fetchData();
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

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("id-ID") : "-";

  const stokOptions = stokList.map((s) => ({
    value: s.id,
    label: `${s.persediaan?.nama || "-"} | Sisa: ${s.sisaStok} | ${s.spesifikasi || ""}`,
    data: s,
  }));

  const unitOptions = unitKerjaList
    .filter((u) => u.id !== unitKerjaId)
    .map((u) => ({
      value: u.id,
      label: u.unitKerja || u.kode,
    }));

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
            <Text fontSize="lg" fontWeight="bold">
              Mutasi Persediaan
            </Text>
            <Box flex={1} />
            <Button variant="primary" onClick={onOpen}>
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
                <Th>Arah</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={7} textAlign="center">
                    Memuat...
                  </Td>
                </Tr>
              ) : mutasiList.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center">
                    Belum ada mutasi
                  </Td>
                </Tr>
              ) : (
                mutasiList.map((m) => {
                  const isAsal = Number(m.unitKerjaAsalId) === Number(unitKerjaId);
                  return (
                    <Tr key={m.id}>
                      <Td>{formatDate(m.tanggal)}</Td>
                      <Td>
                        {m.stokMasukAsal?.persediaan?.nama ||
                          m.stokMasukTujuan?.persediaan?.nama ||
                          "-"}
                      </Td>
                      <Td isNumeric>{m.jumlah}</Td>
                      <Td>{m.unitKerjaAsal?.unitKerja || "-"}</Td>
                      <Td>{m.unitKerjaTujuan?.unitKerja || "-"}</Td>
                      <Td>
                        <Badge colorScheme="green">{m.status}</Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={isAsal ? "orange" : "blue"}>
                          {isAsal ? "Keluar" : "Masuk"}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

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
                onChange={(opt) => {
                  setSelectedStok(opt?.data || null);
                  setJumlah("");
                }}
                chakraStyles={{
                  control: (p) => ({ ...p, bg: "terang", minH: "48px" }),
                }}
              />
            </FormControl>

            {selectedStok && (
              <Text fontSize="sm" color="gray.500" mb={4}>
                Sisa stok tersedia: <strong>{selectedStok.sisaStok}</strong>
              </Text>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>Unit Kerja Tujuan</FormLabel>
              <Select2
                options={unitOptions}
                placeholder="Pilih unit kerja tujuan"
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
