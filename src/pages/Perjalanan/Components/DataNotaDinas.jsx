// src/pages/Perjalanan/components/DataNotaDinas.jsx
import React from "react";
import {
  Box,
  Heading,
  HStack,
  Container,
  FormControl,
  FormLabel,
  Textarea,
  Checkbox,
  Select,
  Flex,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Select as Select2 } from "chakra-react-select";
import { useFormikContext } from "formik";

const DataNotaDinas = ({ dataSeed, state, actions, dataKlasifikasi }) => {
  const { values, errors, touched, setFieldValue } = useFormikContext();
  
  // Pastikan isSrikandi selalu memiliki nilai default
  const isSrikandiChecked = (state.isSrikandi ?? 1) === 1;
  // 0 = Telaahan Staf, 1 = Nota Dinas, 2 = Undangan
  const jenisSelected = state.isNotaDinas ?? 1;
  const isUndangan = jenisSelected === 2;
  const isNotaDinasOrTelaahan = jenisSelected === 0 || jenisSelected === 1;

  return (
    <Container
      maxW={"1280px"}
      variant={"primary"}
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
          Data Surat Pengantar
        </Heading>
      </HStack>
      <Box p={"30px"}>
        <FormControl mb={"25px"}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Jenis
          </FormLabel>
          <Select
            border="1px"
            height={"60px"}
            borderRadius={"8px"}
            borderColor={"rgba(229, 231, 235, 1)"}
            bgColor={"terang"}
            value={jenisSelected}
            onChange={(e) => actions.setIsNotaDinas(parseInt(e.target.value))}
          >
            <option value="1">Nota Dinas</option>
            <option value="0">Telaahan Staf</option>
            <option value="2">Undangan</option>
          </Select>
        </FormControl>

        {isNotaDinasOrTelaahan && (
          <>
        <FormControl
          mb={"25px"}
          isInvalid={touched.klasifikasi && errors.klasifikasi}
        >
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Klasifikasi
          </FormLabel>
          <Select2
            name="klasifikasi"
            options={dataSeed.resultKlasifikasi?.map((val) => ({
              value: val,
              label: `${val.kode}-${val.namaKlasifikasi}`,
            }))}
            placeholder="Cari Klasifikasi"
            value={values.klasifikasi}
            onChange={(selectedOption) => {
              setFieldValue("klasifikasi", selectedOption);
              actions.setKlasifikasi(selectedOption);
              actions.fetchDataKodeKlasifikasi(selectedOption.value.id);
            }}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            chakraStyles={{
              container: (provided) => ({ ...provided, borderRadius: "6px" }),
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
          <FormErrorMessage>{errors.klasifikasi}</FormErrorMessage>
        </FormControl>

        {dataKlasifikasi[0] && (
          <FormControl
            mb={"25px"}
            isInvalid={touched.kodeKlasifikasi && errors.kodeKlasifikasi}
          >
            <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
              Kode Klasifikasi
            </FormLabel>
            <Select2
              name="kodeKlasifikasi"
              options={dataKlasifikasi.map((val) => ({
                value: val,
                label: `${val.kode} - ${val.kegiatan}`,
              }))}
              placeholder="Pilih Klasifikasi"
              value={values.kodeKlasifikasi}
              onChange={(selectedOption) => {
                setFieldValue("kodeKlasifikasi", selectedOption);
                actions.setDataKodeKlasifikasi(selectedOption);
              }}
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
              chakraStyles={{
                container: (provided) => ({ ...provided, borderRadius: "6px" }),
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
            <FormErrorMessage>{errors.kodeKlasifikasi}</FormErrorMessage>
          </FormControl>
        )}
          </>
        )}

        <FormControl mb={"25px"} isInvalid={touched.untuk && errors.untuk}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Untuk
          </FormLabel>
          <Textarea
            name="untuk"
            value={values.untuk}
            onChange={(e) => {
              setFieldValue("untuk", e.target.value);
              actions.setUntuk(e.target.value);
            }}
            placeholder="isi dengan tujuan perjalanan dinas"
            backgroundColor={"terang"}
            p={"20px"}
            minHeight={"160px"}
          />
          <FormErrorMessage>{errors.untuk}</FormErrorMessage>
        </FormControl>

        {isUndangan && (
        <FormControl mb={"25px"} isInvalid={touched.dasar && errors.dasar}>
          <FormLabel fontSize={"20px"} fontWeight={"500"} mb={"10px"}>
            Dasar
          </FormLabel>
          <Textarea
            name="dasar"
            value={values.dasar}
            onChange={(e) => {
              setFieldValue("dasar", e.target.value);
              actions.setDasar(e.target.value);
            }}
            placeholder="isi dengan telaah staff atau undangan"
            backgroundColor={"terang"}
            p={"20px"}
            minHeight={"160px"}
          />
          <FormErrorMessage>{errors.dasar}</FormErrorMessage>
        </FormControl>
        )}
        <Box mb={"25px"} mt="30px">
          <Checkbox
            isChecked={isSrikandiChecked}
            onChange={(e) => {
              const checked = e.target.checked;
              actions.setIsSrikandi(checked ? 1 : 0);
            }}
            size="lg"
            colorScheme="green"
            sx={{
              "& span[data-checked]": {
                bg: "green.500",
                borderColor: "green.500",
              },
              "& span": {
                borderColor: "gray.300",
                borderWidth: "2px",
              },
            }}
          >
            <Box as="span" fontSize="18px" fontWeight="500">
              Srikandi
            </Box>
          </Checkbox>
        </Box>
      </Box>
    </Container>
  );
};

export default DataNotaDinas;
