import React, { useState, useEffect } from "react";
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
  ModalCloseButton,
  Container,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Input,
  useToast,
  Badge,
  VStack,
  Divider,
  Flex,
  Spacer,
  useDisclosure,
  Center,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
  Checkbox,
} from "@chakra-ui/react";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Layout from "../../Componets/Layout";
import LayoutPegawai from "../../Componets/Pegawai/LayoutPegawai";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";
import Loading from "../../Componets/Loading";
function KontrakPJPL() {
  const [dataBendahara, setDataBendahara] = useState(null);
  const [dataPegawai, setDataPegawai] = useState(null);
  const history = useHistory();
  const user = useSelector(userRedux);
  const toast = useToast();
  const role = useSelector(selectRole);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [pegawaiId, setPegawaiId] = useState(null);
  const [unitKerjaId, setUnitKerjaId] = useState(null);
  const [selectedPegawaiIds, setSelectedPegawaiIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();

  async function fetchDataPegawai(unitKerjaIdParam = null) {
    try {
      const url = unitKerjaIdParam
        ? `${
            import.meta.env.VITE_REACT_APP_API_BASE_URL
          }/PJPL/get/pegawai?unitKerjaId=${unitKerjaIdParam}`
        : `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/get/pegawai`;

      const res = await axios.get(url);
      setDataPegawai(res.data.result);
      console.log(res.data.result);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error!",
        description: "Gagal memuat data pegawai",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  //   const tambahPejabat = () => {
  //     axios
  //       .post(
  //         `${
  //           import.meta.env.VITE_REACT_APP_API_BASE_URL
  //         }/PJPL/post/pejabat-verifikator`,
  //         {
  //           pegawaiId,
  //           unitKerjaId,
  //         }
  //       )
  //       .then((res) => {
  //         console.log(res.status, res.data, "tessss");
  //         toast({
  //           title: "Berhasil!",
  //           description: "Data berhasil dikirim.",
  //           status: "success",
  //           duration: 5000,
  //           isClosable: true,
  //         });
  //         onTambahClose();
  //         fetchDataPejabat();
  //       })
  //       .catch((err) => {
  //         console.error(err.message);
  //         toast({
  //           title: "Error!",
  //           description: "Data gagal ditambahkan",
  //           status: "error",
  //           duration: 5000,
  //           isClosable: true,
  //         });
  //         onTambahClose();
  //       });
  //   };

  useEffect(() => {
    fetchDataPegawai(unitKerjaId);
  }, [unitKerjaId]);

  useEffect(() => {
    setSelectedPegawaiIds([]);
  }, [tanggalAwal, tanggalAkhir, unitKerjaId]);

  const canSelectPegawai = Boolean(tanggalAwal && tanggalAkhir);
  const displayedPegawaiIds =
    dataPegawai?.map((item) => item?.id).filter(Boolean) || [];
  const areAllPegawaiSelected =
    canSelectPegawai &&
    displayedPegawaiIds.length > 0 &&
    displayedPegawaiIds.every((id) => selectedPegawaiIds.includes(id));
  const isPartiallySelected =
    canSelectPegawai && selectedPegawaiIds.length > 0 && !areAllPegawaiSelected;

  const handleTogglePegawai = (id) => {
    setSelectedPegawaiIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (!canSelectPegawai) return;
    setSelectedPegawaiIds((prev) =>
      areAllPegawaiSelected
        ? []
        : Array.from(new Set([...prev, ...displayedPegawaiIds]))
    );
  };

  const handleSubmitPegawaiTerpilih = async () => {
    if (!canSelectPegawai || selectedPegawaiIds.length === 0) {
      toast({
        title: "Lengkapi data",
        description: "Isi tanggal awal/akhir dan pilih minimal satu pegawai.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/PJPL/post/kontrak`,
        {
          tanggalAwal,
          tanggalAkhir,

          pegawaiIds: selectedPegawaiIds,
        }
      );
      toast({
        title: "Berhasil!",
        description: "Data pegawai berhasil dikirim.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setSelectedPegawaiIds([]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Gagal mengirim",
        description:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat mengirim data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutPegawai>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Container maxW={"1280px"} variant={"primary"} p={"30px"} my={"30px"}>
          <Flex gap={4} mb={4}>
            <FormControl>
              <FormLabel>Tanggal Berangkat (Awal)</FormLabel>
              <Input
                type="date"
                value={tanggalAwal}
                onChange={(e) => setTanggalAwal(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Tanggal Pulang (Akhir)</FormLabel>
              <Input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
              />
            </FormControl>
          </Flex>
          <FormControl my={"30px"}>
            <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
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
                setUnitKerjaId(selectedOption?.value || null);
                setSelectedPegawaiIds([]);
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
                  backgroundColor: "terang",
                  border: "0px",
                  height: "60px",
                  _hover: { borderColor: "yellow.700" },
                  minHeight: "40px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  bg: state.isFocused ? "pegawai" : "white",
                  color: state.isFocused ? "white" : "black",
                }),
              }}
            />
          </FormControl>
          <Table variant={"pegawai"}>
            <Thead>
              <Tr>
                {canSelectPegawai && (
                  <Th>
                    <Checkbox
                      isChecked={areAllPegawaiSelected}
                      isIndeterminate={isPartiallySelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Pilih semua pegawai"
                    />
                  </Th>
                )}
                <Th>No</Th>
                <Th>Nama</Th>
                <Th>Jabatan</Th>
                <Th>Pendidikan</Th>
                <Th>Unit Kerja</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody bgColor={"secondary"}>
              {dataPegawai &&
                dataPegawai?.map((item, index) => (
                  <Tr key={`${index}`}>
                    {canSelectPegawai && (
                      <Td>
                        <Checkbox
                          isChecked={selectedPegawaiIds.includes(item?.id)}
                          onChange={() => handleTogglePegawai(item?.id)}
                        />
                      </Td>
                    )}
                    <Td>{index + 1}</Td>
                    <Td>{item?.nama}</Td>
                    <Td>{item?.jabatan}</Td>
                    <Td>{item?.pendidikan || "-"}</Td>
                    <Td>{item?.daftarUnitKerja?.unitKerja}</Td>

                    <Td>
                      <Flex gap={"20px"}>
                        <Button
                          onClick={() => {
                            history.push(
                              `/admin-pegawai/detail-kontrak/${item.id}`
                            );
                          }}
                          variant={"primary"}
                        >
                          Detail
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
          <Flex mt={6} justifyContent="flex-end">
            <Button
              variant={"primary"}
              onClick={handleSubmitPegawaiTerpilih}
              isDisabled={!canSelectPegawai || selectedPegawaiIds.length === 0}
              isLoading={isSubmitting}
            >
              Kirim Pegawai Terpilih
            </Button>
          </Flex>
        </Container>
      </Box>
    </LayoutPegawai>
  );
}

export default KontrakPJPL;
