import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { HStack, Box, Radio } from "@chakra-ui/react";

function StarRating({ rating, setRating }) {
  const [ hover, setHover ] = useState(null);

  return (
    <HStack spacing="2px">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Box
            as="label"
            key={index}
            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
          >
            <Radio
              onChange={() => setRating(ratingValue)}
              value={ratingValue}
              display="none"
            ></Radio>
            <FaStar
              cursor="pointer"
              size={50}
              transition="color 200ms"
            />
          </Box>
        );
      })}
    </HStack>
  );
};

export default StarRating;