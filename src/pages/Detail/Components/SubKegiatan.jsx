import React from "react";
import { Box, Text, HStack, Button, Icon } from "@chakra-ui/react";
import { FiTarget, FiEdit3 } from "react-icons/fi";

function SubKegiatan({
  detailPerjalanan,
  adaStatusDuaAtauTiga,
  onEditSubKegiatanClick,
}) {
  return (
    <Box mb={{ base: 4, md: 6 }}>
      <HStack spacing={3} align="center" flexWrap="wrap">
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.600"
          textTransform="uppercase"
        >
          SUB KEGIATAN
        </Text>
        <Box w="6px" h="6px" borderRadius="full" bg="purple.500" />
        <Text fontSize="md" fontWeight="medium" flex={1}>
          {detailPerjalanan?.daftarSubKegiatan?.subKegiatan || "-"}
        </Text>
        {!adaStatusDuaAtauTiga && (
          <Button
            size="sm"
            leftIcon={<FiEdit3 />}
            colorScheme="purple"
            variant="outline"
            onClick={onEditSubKegiatanClick}
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Edit
          </Button>
        )}
      </HStack>
    </Box>
  );
}

export default SubKegiatan;

