import React, { useMemo, useState } from "react";
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Container,
  HStack,
  Box,
  Heading,
  Text,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { Select as Select2, AsyncSelect } from "chakra-react-select";
import { useFormikContext } from "formik";
import axios from "axios";

const getHariBetween = (tanggalAwal, tanggalAkhir) => {
  if (!tanggalAwal || !tanggalAkhir) return 0;
  const start = new Date(tanggalAwal);
  const end = new Date(tanggalAkhir);
  if (end < start) return 0;
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inklusif (hari berangkat + hari pulang dihitung)
};

const DataPerjalanan = ({
  state,
  actions,
  dataKota,
  dataSeed,
  perjalananKota,
  indukUnitKerjaId,
}) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formTujuan, setFormTujuan] = useState({
    nama: "",
    durasi: "",
    uangTransport: "",
  });
  const [isSubmittingTujuan, setIsSubmittingTujuan] = useState(false);

  const handleOpenModalTujuan = () => {
    setFormTujuan({ nama: "", durasi: "", uangTransport: "" });
    onOpen();
  };

  const handleSubmitTujuan = async () => {
    if (!formTujuan.nama?.trim()) {
      toast({
        title: "Nama wajib diisi",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (!indukUnitKerjaId) {
      toast({
        title: "Unit kerja tidak ditemukan",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setIsSubmittingTujuan(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/tujuan/post/`,
        {
          nama: formTujuan.nama.trim(),
          durasi: Number(formTujuan.durasi) || 0,
          uangTransport: Number(formTujuan.uangTransport) || 0,
          indukUnitKerjaId,
          status: "nonaktif",
        }
      );
      toast({
        title: "Tujuan berhasil ditambah",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      onClose();
      setFormTujuan({ nama: "", durasi: "", uangTransport: "" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Gagal menambah tujuan",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmittingTujuan(false);
    }
  };

  const totalDurasiDalamKota = useMemo(() => {
    return (
      dataKota?.reduce(
        (sum, item) => sum + (Number(item.dataDalamKota?.durasi) || 0),
        0
      ) ?? 0
    );
  }, [dataKota]);

  return (
    <Container
      variant={"primary"}
      maxW={"1280px"}
      pt={"30px"}
      ps={"0px"}
      mb={"30px"}
    >
      <HStack mb={"20px"}>
        <Box
          bgColor={"primary"}
          width={"30px"}
          height={"30px"}
          borderRadius={"4px"}
        ></Box>
        <Heading color={"primary"} fontSize={"28px"} fontWeight={"600"}>
          Data Perjalanan Dinas
        </Heading>
      </HStack>

      <Box p={"30px"}>
        <FormControl
          mb={"25px"}
          isInvalid={touched.jenisPerjalanan && errors.jenisPerjalanan}
        >
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Jenis Perjalanan
          </FormLabel>
          <Select2
            options={state.dataJenisPerjalanan?.map((val) => {
              return {
                value: val,
                label: `${val.jenis}`,
              };
            })}
            placeholder="Jenis Perjalanan"
            focusBorderColor="red"
            onChange={(selectedOption) => {
              actions.setJenisPerjalanan(selectedOption);
              setFieldValue("jenisPerjalanan", selectedOption);
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
          />{" "}
          <FormErrorMessage>{errors.jenisPerjalanan}</FormErrorMessage>
        </FormControl>
        {state.jenisPerjalanan?.value?.jenis?.includes("Pelayanan") ? (
          <FormControl mb={"25px"}>
            <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
              Jenis Pelayanan Kesehatan
            </FormLabel>
            <Select2
              options={dataSeed.resultPelayananKesehatan.map((val) => {
                return {
                  value: val.id,
                  label: `${val.jenis}`,
                };
              })}
              placeholder="Jenis Perjalanan"
              focusBorderColor="red"
              onChange={(selectedOption) => {
                actions.setJenisPelayananKesehatan(selectedOption.value);
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
        ) : null}

        {state.jenisPerjalanan?.value?.tipePerjalananId === 2 ? (
          <Flex mb={"25px"} gap={4} direction="column">
            {perjalananKota?.map((item, index) => (
              <Flex key={index} gap={4}>
                <FormControl>
                  <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                    Nama Kota
                  </FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    value={item.kota}
                    onChange={(e) =>
                      actions.handlePerjalananChange(
                        index,
                        "kota",
                        e.target.value
                      )
                    }
                    placeholder="Masukkan Kota"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                    Tanggal Berangkat
                  </FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="date"
                    defaultValue={item.tanggalBerangkat}
                    onChange={(e) =>
                      actions.handlePerjalananChange(
                        index,
                        "tanggalBerangkat",
                        e.target.value
                      )
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                    Tanggal Pulang
                  </FormLabel>
                  <Input
                    height={"60px"}
                    bgColor={"terang"}
                    type="date"
                    defaultValue={item.tanggalPulang}
                    onChange={(e) =>
                      actions.handlePerjalananChange(
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
              onClick={actions.addPerjalanan}
            >
              Tambah Tujuan
            </Button>
          </Flex>
        ) : state.jenisPerjalanan?.value?.tipePerjalananId === 1 ? (
          <Box>
            {dataKota.map((item, index) => {
              return (
                <Flex key={index} gap={4}>
                  <FormControl border={0} bgColor={"white"}>
                    <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                      Tujuan
                    </FormLabel>
                    <AsyncSelect
                      loadOptions={async (inputValue) => {
                        if (!inputValue?.trim()) return [];
                        try {
                          const params = new URLSearchParams({
                            q: inputValue.trim(),
                            ...(indukUnitKerjaId && {
                              id: indukUnitKerjaId,
                            }),
                          });
                          const res = await axios.get(
                            `${
                              import.meta.env.VITE_REACT_APP_API_BASE_URL
                            }/dalam-kota/get/serach?${params}`
                          );
                          const list = res.data?.result ?? [];
                          return list.map((val) => ({
                            value: {
                              id: val.id,
                              nama: val.nama,
                              durasi: val.durasi ?? 0,
                            },
                            label: val.nama,
                          }));
                        } catch (err) {
                          console.error("Search dalam kota:", err);
                          return [];
                        }
                      }}
                      placeholder="Cari Tujuan Dalam Kota"
                      focusBorderColor="red"
                      value={
                        item.dataDalamKota
                          ? {
                              value: item.dataDalamKota,
                              label: item.dataDalamKota.nama,
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        actions.handleDalamKotaChange(
                          index,
                          "dataDalamKota",
                          selectedOption?.value ?? null
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
                  <FormControl>
                    <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                      Tanggal berangkat
                    </FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      type="date"
                      defaultValue={item.tanggalBerangkat}
                      onChange={(e) =>
                        actions.handleDalamKotaChange(
                          index,
                          "tanggalBerangkat",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
                      Tanggal Pulang
                    </FormLabel>
                    <Input
                      height={"60px"}
                      bgColor={"terang"}
                      type="date"
                      defaultValue={item.tanggalPulang}
                      onChange={(e) =>
                        actions.handleDalamKotaChange(
                          index,
                          "tanggalPulang",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                </Flex>
              );
            })}

            <Flex mt={"15px"} gap={3} flexWrap="wrap">
              {dataKota.length <= 2 && (
                <Button
                  p={"25px"}
                  variant={"secondary"}
                  onClick={actions.addDataKota}
                >
                  Tambah Tujuan
                </Button>
              )}
              <Button
                p={"25px"}
                variant={"outline"}
                colorScheme="primary"
                onClick={handleOpenModalTujuan}
              >
                Tambah Data Tujuan Dalam Kota
              </Button>
            </Flex>
          </Box>
        ) : null}

        {state.jenisPerjalanan?.value?.tipePerjalananId === 1 &&
        totalDurasiDalamKota > 0 ? (
          <Box mb={"25px"} p={"15px"} bgColor={"terang"} borderRadius={"6px"}>
            <Text fontSize={"16px"} fontWeight={"500"}>
              Total Durasi (Dalam Kota): <strong>{totalDurasiDalamKota}</strong>{" "}
              jam
            </Text>
          </Box>
        ) : null}

        <FormControl
          mb={"25px"}
          isInvalid={touched.subKegiatan && errors.subKegiatan}
        >
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Sub Kegiatan
          </FormLabel>
          <Select2
            options={dataSeed?.resultDaftarSubKegiatan?.map((val) => {
              return {
                value: val,
                label: `${val.subKegiatan} - ${val.kodeRekening}`,
              };
            })}
            placeholder="Cari Kegiatan"
            focusBorderColor="red"
            onChange={(selectedOption) => {
              setFieldValue("subKegiatan", selectedOption);
              actions.setDataSubKegiatan(selectedOption);
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
          <FormErrorMessage>{errors.subKegiatan}</FormErrorMessage>
        </FormControl>

        {state.dataSubKegiatan.value ? (
          <Box mb={"25px"} p={"15px"} bgColor={"terang"} borderRadius={"6px"}>
            <Text fontSize={"16px"} fontWeight={"500"}>
              {`Kode Rekening: ${state.dataSubKegiatan?.value?.kodeRekening}${state.jenisPerjalanan?.value?.kodeRekening}`}
            </Text>
          </Box>
        ) : null}

        <Flex gap={4} mb={"25px"}>
          <FormControl
            isInvalid={touched.pengajuan && errors.pengajuan}
            flex={1}
          >
            <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
              Tanggal Pengajuan
            </FormLabel>
            <Input
              name="tanggalPengajuan"
              type="date"
              value={values.pengajuan}
              onChange={(e) => setFieldValue("pengajuan", e.target.value)}
              height={"60px"}
              bgColor={"terang"}
            />
            <FormErrorMessage>{errors.pengajuan}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={touched.asal && errors.asal} flex={1}>
            <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
              Asal
            </FormLabel>
            <Input
              onChange={(e) => {
                actions.setAsal(e.target.value);
                setFieldValue("asal", e.target.value);
              }}
              value={values.asal}
              height={"60px"}
              bgColor={"terang"}
            />
            <FormErrorMessage>{errors.asal}</FormErrorMessage>
          </FormControl>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Tambah Tujuan Dalam Kota</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Nama Tujuan</FormLabel>
              <Input
                placeholder="Contoh: Puskesmas A"
                value={formTujuan.nama}
                onChange={(e) =>
                  setFormTujuan((prev) => ({ ...prev, nama: e.target.value }))
                }
                bgColor="terang"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Durasi (jam)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={formTujuan.durasi}
                onChange={(e) =>
                  setFormTujuan((prev) => ({ ...prev, durasi: e.target.value }))
                }
                bgColor="terang"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Uang Transport</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={formTujuan.uangTransport}
                onChange={(e) =>
                  setFormTujuan((prev) => ({
                    ...prev,
                    uangTransport: e.target.value,
                  }))
                }
                bgColor="terang"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button
              colorScheme="primary"
              onClick={handleSubmitTujuan}
              isLoading={isSubmittingTujuan}
              loadingText="Menyimpan..."
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DataPerjalanan;
