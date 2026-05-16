import React from "react";
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
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { useFormikContext } from "formik";

const DataPerjalanan = ({
  state,
  actions,
  dataKota,
  dataSeed,
  perjalananKota,
}) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();
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
              Tambah Kota
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
                    <Select2
                      options={dataSeed?.resultDalamKota?.map((val) => {
                        return {
                          value: { id: val.id, nama: val.nama },
                          label: `${val.nama}`,
                        };
                      })}
                      placeholder="Pilih Tujuan"
                      focusBorderColor="red"
                      value={
                        item.dataDalamKota
                          ? {
                              value: item.dataDalamKota,
                              label: dataSeed.resultDalamKota.find(
                                (val) => val.id === item.dataDalamKota.id
                              )?.nama,
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        actions.handleDalamKotaChange(
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

            {dataKota.length > 2 ? null : (
              <Button
                p={"25px"}
                mt={"15px"}
                variant={"secondary"}
                onClick={actions.addDataKota}
              >
                Tambah Kota
              </Button>
            )}
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
    </Container>
  );
};

export default DataPerjalanan;
