import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Componets/Layout";
import ReactPaginate from "react-paginate";
import { BsFileEarmarkArrowDown } from "react-icons/bs";
import {
  Select as Select2,
  CreatableSelect,
  AsyncSelect,
} from "chakra-react-select";
import "../../Style/pagination.css";
import { Link, useHistory } from "react-router-dom";
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
  Th,
  Td,
  Flex,
  Textarea,
  Tooltip,
  Input,
  Spacer,
  useToast,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { BsEyeFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { userRedux, selectRole } from "../../Redux/Reducers/auth";

import DataKosong from "../../Componets/DataKosong";

function DaftarSPPD() {
  const { colorMode } = useColorMode();
  const user = useSelector(userRedux);
  const role = useSelector(selectRole);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [pages, setPages] = useState(0);
  const [rows, setRows] = useState(0);
  const [pegawaiId, setPegawaiId] = useState(0);
  const [time, setTime] = useState("");
  const [dataSubKegiatan, setDataSubKegiatan] = useState(null);
  const [subKegiatanId, setSubKegiatanId] = useState(0);
  const [dataRekap, setDataRekap] = useState([]);
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [dataUnitKerja, setDataUnitKerja] = useState(null);
  const [untuk, setUntuk] = useState("");
  const [selectedUnitKerja, setSelectedUnitKerja] = useState(null);
  // State untuk modal Tambah
  const {
    isOpen: isTambahOpen,
    onOpen: onTambahOpen,
    onClose: onTambahClose,
  } = useDisclosure();
  const toast = useToast();
  // Tambah SPPD modal states
  const [personilsTambah, setPersonilsTambah] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [dataSeed, setDataSeed] = useState(null);
  const [dataJenisPerjalanan, setDataJenisPerjalanan] = useState([]);
  const [selectedJenisPerjalanan, setSelectedJenisPerjalanan] = useState(null);
  const [perjalananKota, setPerjalananKota] = useState([
    { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [dataKota, setDataKota] = useState([
    { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
  ]);
  const [isSubmittingTambah, setIsSubmittingTambah] = useState(false);

  const resetModalForm = () => {
    setPersonilsTambah([null, null, null, null, null]);
    setDataSeed(null);
    setDataJenisPerjalanan([]);
    setSelectedJenisPerjalanan(null);
    setPerjalananKota([{ kota: "", tanggalBerangkat: "", tanggalPulang: "" }]);
    setDataKota([
      { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const fetchSeedPerjalanan = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/seed?indukUnitKerjaId=${
          user[0]?.unitKerja_profile?.indukUnitKerja.id
        }&unitKerjaId=${user[0]?.unitKerja_profile?.id}`
      );
      setDataSeed(res.data);
      const sumberPertama = res.data?.resultSumberDana?.[0];
      if (sumberPertama?.id) {
        await fetchJenisPerjalanan(sumberPertama.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJenisPerjalanan = async (sumberDanaId) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/perjalanan/get/jenis-perjalanan/${sumberDanaId}`
      );
      setDataJenisPerjalanan(res.data?.result || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTambah = async () => {
    resetModalForm();
    await fetchSeedPerjalanan();
    onTambahOpen();
  };

  const handlePerjalananChange = (index, field, value) => {
    const next = [...perjalananKota];
    next[index][field] = value;
    setPerjalananKota(next);
  };

  const addPerjalanan = () => {
    setPerjalananKota([
      ...perjalananKota,
      { kota: "", tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const handleDalamKotaChange = (index, field, value) => {
    const next = [...dataKota];
    next[index][field] = value;
    setDataKota(next);
  };

  const addDataKota = () => {
    setDataKota([
      ...dataKota,
      { dataDalamKota: null, tanggalBerangkat: "", tanggalPulang: "" },
    ]);
  };

  const changePage = ({ selected }) => {
    setPage(selected);
  };
  async function fetchSubKegiatan() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/sub-kegiatan/get-filter/${user[0]?.unitKerja_profile?.id}`
      );
      setDataSubKegiatan(res.data.result);

      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  }
  async function fetchDataRekap() {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_API_BASE_URL
        }/rekap/get/sppd?time=${time}&page=${page}&limit=${limit}&subKegiatanId=${subKegiatanId}&unitKerjaId=${
          user[0]?.unitKerja_profile?.id
        }&tanggalBerangkat=${tanggalAwal}&tanggalPulang=${tanggalAkhir}&pegawaiId=${pegawaiId}`
      );
      setDataRekap(res.data.result);
      setPage(res.data.page);
      setPages(res.data.totalPage);
      setRows(res.data.totalRows);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchDataRekap();
    fetchSubKegiatan();
  }, [page, subKegiatanId, tanggalAkhir, tanggalAwal, pegawaiId]);

  return (
    <Layout>
      <Box bgColor={"secondary"} pb={"40px"} px={"30px"}>
        <Box
          style={{ overflowX: "auto" }}
          bgColor={"white"}
          p={"30px"}
          borderRadius={"5px"}
          bg={colorMode === "dark" ? "gray.800" : "white"}
          mb={"40px"}
        >
          {JSON.stringify(dataSeed)}
          <Flex gap={4} mb={4} zIndex={999} alignItems="flex-end">
            <FormControl my={"30px"}>
              <FormLabel fontSize={"24px"}>Nama Pegawai</FormLabel>
              <AsyncSelect
                loadOptions={async (inputValue) => {
                  if (!inputValue) return [];
                  try {
                    const res = await axios.get(
                      `${
                        import.meta.env.VITE_REACT_APP_API_BASE_URL
                      }/pegawai/search?q=${inputValue}`
                    );
                    return res.data.result.map((val) => ({
                      value: val,
                      label: val.nama,
                    }));
                  } catch (err) {
                    console.error("Failed to load options:", err.message);
                    return [];
                  }
                }}
                placeholder="Ketik Nama Pegawai"
                onChange={(selectedOption) => {
                  setPegawaiId(selectedOption.value.id);
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
                    height: "60px",
                    _hover: { borderColor: "yellow.700" },
                    minHeight: "40px",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    bg: state.isFocused ? "primary" : "white",
                    color: state.isFocused ? "white" : "black",
                  }),
                }}
              />
            </FormControl>
            <FormControl my={"30px"}>
              <FormLabel fontSize={"24px"}> Sub Kegiatan</FormLabel>
              <Select2
                options={dataSubKegiatan?.map((val) => {
                  return {
                    value: val.id,
                    label: `${val.subKegiatan} - ${val.kodeRekening}`,
                  };
                })}
                placeholder="Cari Kegiatan"
                focusBorderColor="red"
                onChange={(selectedOption) => {
                  setSubKegiatanId(selectedOption.value);
                }}
                components={{
                  DropdownIndicator: () => null, // Hilangkan tombol panah
                  IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
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
                    _hover: {
                      borderColor: "yellow.700",
                    },
                    minHeight: "40px",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    bg: state.isFocused ? "primary" : "white",
                    color: state.isFocused ? "white" : "black",
                  }),
                }}
              />
            </FormControl>
            <Spacer />
            <Button variant={"secondary"} mt="30px" onClick={handleOpenTambah}>
              Tambah
            </Button>
          </Flex>{" "}
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
        </Box>
        <Box
          style={{ overflowX: "auto" }}
          bgColor={"white"}
          p={"30px"}
          borderRadius={"5px"}
          bg={colorMode === "dark" ? "gray.800" : "white"}
        >
          <Table variant={"primary"}>
            <Thead>
              <Tr>
                {" "}
                <Th>Nama Pegawai</Th> <Th>No. SPD</Th>
                <Th>No. Surat Tugas</Th>
                <Th>Tujuan</Th>
                <Th>Tanggal Berangkat</Th>
                <Th>Tanggal Pulang</Th>
                <Th>Sub Kegiatan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataRekap && dataRekap.length > 0 ? (
                dataRekap.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>{item.pegawai?.nama || "-"}</Td>
                    <Td>{item.nomorSPD || "-"}</Td>
                    <Td>{item.perjalanan?.noSuratTugas || "-"}</Td>
                    <Td>
                      {item.perjalanan?.tempats &&
                      item.perjalanan.tempats.length > 0
                        ? item.perjalanan?.tipePerjalanan?.id === 1
                          ? item.perjalanan.tempats.map((val) => (
                              <Text key={val.id}>
                                {val.dalamKota?.nama || "-"}
                              </Text>
                            ))
                          : item.perjalanan.tempats.map((val) => (
                              <Text key={val.id}>{val.tempat || "-"}</Text>
                            ))
                        : "-"}
                    </Td>
                    <Td>
                      {item.perjalanan?.tanggalBerangkat
                        ? new Date(
                            item.perjalanan.tanggalBerangkat
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </Td>
                    <Td>
                      {item.perjalanan?.tanggalPulang
                        ? new Date(
                            item.perjalanan.tanggalPulang
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </Td>
                    <Td>
                      {item.perjalanan?.daftarSubKegiatan?.subKegiatan || "-"}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8} textAlign="center">
                    <DataKosong />
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>{" "}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              boxSizing: "border-box",
              width: "100%",
              height: "100%",
            }}
          >
            <ReactPaginate
              previousLabel={"+"}
              nextLabel={"-"}
              pageCount={pages}
              onPageChange={changePage}
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
          </div>{" "}
        </Box>

        {/* Modal Tambah SPPD */}
        <Modal
          isOpen={isTambahOpen}
          onClose={isSubmittingTambah ? () => {} : onTambahClose}
          closeOnOverlayClick={!isSubmittingTambah}
        >
          <ModalOverlay />
          <ModalContent borderRadius={0} maxWidth="800px">
            <ModalHeader>Tambah SPPD</ModalHeader>
            <ModalCloseButton disabled={isSubmittingTambah} />
            <ModalBody>
              {/* Personil 1-5 */}
              <Box>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <FormControl key={idx} my="10px">
                    <FormLabel fontSize={"24px"}>{`Personil ${
                      idx + 1
                    }`}</FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue) return [];
                        try {
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/pegawai/search?q=${inputValue}`
                          );
                          const filtered = res.data.result
                            ?.filter((val) => val.profesiId !== 1)
                            .map((val) => ({ value: val, label: val.nama }));
                          return filtered || [];
                        } catch (err) {
                          console.error("Failed to load options:", err.message);
                          return [];
                        }
                      }}
                      placeholder="Ketik Nama Pegawai"
                      onChange={(selectedOption) => {
                        const next = [...personilsTambah];
                        next[idx] = selectedOption;
                        setPersonilsTambah(next);
                      }}
                      value={personilsTambah[idx] || null}
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
                          bg: state.isFocused ? "primary" : "white",
                          color: state.isFocused ? "white" : "black",
                        }),
                      }}
                    />
                  </FormControl>
                ))}
              </Box>

              {/* Jenis Perjalanan */}
              <FormControl my={"15px"}>
                <FormLabel fontSize={"24px"}>Jenis Perjalanan</FormLabel>
                <Select2
                  options={dataJenisPerjalanan?.map((val) => ({
                    value: val,
                    label: `${val.jenis}`,
                  }))}
                  placeholder="Jenis Perjalanan"
                  focusBorderColor="red"
                  onChange={(selectedOption) =>
                    setSelectedJenisPerjalanan(selectedOption)
                  }
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
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>

              {/* Input dinamis tujuan/tanggal */}
              {selectedJenisPerjalanan?.value?.tipePerjalananId === 2 ? (
                <Flex my={"30px"} gap={4} direction="column">
                  {perjalananKota.map((item, index) => (
                    <Flex key={index} gap={4}>
                      <FormControl>
                        <FormLabel fontSize={"24px"}>Nama Kota</FormLabel>
                        <Input
                          height={"60px"}
                          bgColor={"terang"}
                          value={item.kota}
                          onChange={(e) =>
                            handlePerjalananChange(
                              index,
                              "kota",
                              e.target.value
                            )
                          }
                          placeholder="Masukkan Kota"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"24px"}>
                          Tanggal Berangkat
                        </FormLabel>
                        <Input
                          height={"60px"}
                          bgColor={"terang"}
                          type="date"
                          defaultValue={item.tanggalBerangkat}
                          onChange={(e) =>
                            handlePerjalananChange(
                              index,
                              "tanggalBerangkat",
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"24px"}>Tanggal Pulang</FormLabel>
                        <Input
                          height={"60px"}
                          bgColor={"terang"}
                          type="date"
                          defaultValue={item.tanggalPulang}
                          onChange={(e) =>
                            handlePerjalananChange(
                              index,
                              "tanggalPulang",
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                    </Flex>
                  ))}
                  <Button
                    p={"25px"}
                    mt={"15px"}
                    variant={"secondary"}
                    onClick={addPerjalanan}
                  >
                    Tambah Kota
                  </Button>
                </Flex>
              ) : selectedJenisPerjalanan?.value?.tipePerjalananId === 1 ? (
                <Box>
                  {dataKota.map((item, index) => (
                    <Flex key={index} gap={4}>
                      <FormControl border={0} bgColor={"white"}>
                        <FormLabel fontSize={"24px"}>Tujuan</FormLabel>
                        <Select2
                          options={dataSeed?.resultDalamKota?.map((val) => ({
                            value: { id: val.id, nama: val.nama },
                            label: `${val.nama}`,
                          }))}
                          placeholder="Pilih Tujuan"
                          focusBorderColor="red"
                          value={
                            item.dataDalamKota
                              ? {
                                  value: item.dataDalamKota,
                                  label: dataSeed?.resultDalamKota?.find(
                                    (val) => val.id === item.dataDalamKota.id
                                  )?.nama,
                                }
                              : null
                          }
                          onChange={(selectedOption) =>
                            handleDalamKotaChange(
                              index,
                              "dataDalamKota",
                              selectedOption.value
                            )
                          }
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
                              bg: state.isFocused ? "primary" : "white",
                              color: state.isFocused ? "white" : "black",
                            }),
                          }}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"24px"}>
                          Tanggal berangkat
                        </FormLabel>
                        <Input
                          height={"60px"}
                          bgColor={"terang"}
                          type="date"
                          defaultValue={item.tanggalBerangkat}
                          onChange={(e) =>
                            handleDalamKotaChange(
                              index,
                              "tanggalBerangkat",
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize={"24px"}>Tanggal Pulang</FormLabel>
                        <Input
                          height={"60px"}
                          bgColor={"terang"}
                          type="date"
                          defaultValue={item.tanggalPulang}
                          onChange={(e) =>
                            handleDalamKotaChange(
                              index,
                              "tanggalPulang",
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                    </Flex>
                  ))}
                  {dataKota.length > 2 ? null : (
                    <Button
                      p={"25px"}
                      mt={"15px"}
                      variant={"secondary"}
                      onClick={addDataKota}
                    >
                      Tambah Kota
                    </Button>
                  )}
                </Box>
              ) : null}
              <FormControl border={0} bgColor={"white"} flex="1">
                <FormLabel fontSize={"24px"}>Unit Kerja</FormLabel>
                <Select2
                  options={dataSeed?.resultUnitKerja?.map((val) => ({
                    value: val,
                    label: `${val.kode}`,
                  }))}
                  placeholder="Pilih Klasifikasi"
                  focusBorderColor="red"
                  onChange={(selectedOption) => {
                    setSelectedUnitKerja(selectedOption.value);
                  }}
                  components={{
                    DropdownIndicator: () => null, // Hilangkan tombol panah
                    IndicatorSeparator: () => null, // Kalau mau sekalian hilangkan garis vertikal
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
                      _hover: {
                        borderColor: "yellow.700",
                      },
                      minHeight: "40px",
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? "primary" : "white",
                      color: state.isFocused ? "white" : "black",
                    }),
                  }}
                />
              </FormControl>
              <FormControl my={"30px"}>
                <FormLabel fontSize={"24px"}>Maksud Perjalanan</FormLabel>
                <Input
                  value={untuk}
                  height={"60px"}
                  bgColor={"terang"}
                  onChange={(e) => setUntuk(e.target.value)}
                  placeholder="Perihal"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onTambahClose}
                disabled={isSubmittingTambah}
              >
                Batal
              </Button>
              <Button
                variant={"secondary"}
                isLoading={isSubmittingTambah}
                onClick={async () => {
                  const selectedPegawaiIds = personilsTambah
                    .filter((p) => p && p.value && p.value.id)
                    .map((p) => p.value.id);

                  if (selectedPegawaiIds.length === 0) {
                    toast({
                      title: "Gagal",
                      description: "Minimal pilih 1 pegawai",
                      status: "error",
                      duration: 2500,
                      isClosable: true,
                      position: "top",
                    });
                    return;
                  }
                  if (!selectedJenisPerjalanan?.value) {
                    toast({
                      title: "Gagal",
                      description: "Jenis perjalanan wajib dipilih",
                      status: "error",
                      duration: 2500,
                      isClosable: true,
                      position: "top",
                    });
                    return;
                  }

                  // Siapkan tempats
                  let tempats = [];
                  if (selectedJenisPerjalanan.value.tipePerjalananId === 2) {
                    tempats = perjalananKota
                      .filter(
                        (t) => t.kota && t.tanggalBerangkat && t.tanggalPulang
                      )
                      .map((t) => ({
                        tempat: t.kota,
                        tanggalBerangkat: t.tanggalBerangkat,
                        tanggalPulang: t.tanggalPulang,
                      }));
                  } else if (
                    selectedJenisPerjalanan.value.tipePerjalananId === 1
                  ) {
                    tempats = dataKota
                      .filter(
                        (t) =>
                          t.dataDalamKota &&
                          t.tanggalBerangkat &&
                          t.tanggalPulang
                      )
                      .map((t) => ({
                        dalamKotaId: t.dataDalamKota.id,
                        tanggalBerangkat: t.tanggalBerangkat,
                        tanggalPulang: t.tanggalPulang,
                      }));
                  }

                  try {
                    setIsSubmittingTambah(true);
                    await axios.post(
                      `${
                        import.meta.env.VITE_REACT_APP_API_BASE_URL
                      }/rekap/post/sppd`,
                      {
                        pegawaiIds: selectedPegawaiIds,
                        untuk,
                        jenisPerjalananId: selectedJenisPerjalanan.value.id,
                        tipePerjalananId:
                          selectedJenisPerjalanan.value.tipePerjalananId,
                        tempats,
                        unitKerjaFE: selectedUnitKerja,
                        indukUnitKerjaFE:
                          user[0].unitKerja_profile.indukUnitKerja,
                      }
                    );
                    toast({
                      title: "Berhasil",
                      description: "Data SPPD berhasil ditambahkan",
                      status: "success",
                      duration: 2500,
                      isClosable: true,
                      position: "top",
                    });
                    resetModalForm();
                    onTambahClose();
                    fetchDataRekap();
                  } catch (err) {
                    console.error(err);
                    toast({
                      title: "Gagal",
                      description:
                        err?.response?.data?.message ||
                        "Terjadi kesalahan saat menyimpan",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  } finally {
                    setIsSubmittingTambah(false);
                  }
                }}
              >
                Simpan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}
export default DaftarSPPD;
