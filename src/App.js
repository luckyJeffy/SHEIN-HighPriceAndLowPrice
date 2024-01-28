import './App.css';
import {
  AspectRatio,
  Box,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import $ from 'jquery';
import _ from 'lodash';

const defaultPriceInfo = {
  price: 0,
  title: '-',
  src: '-',
};

function App() {
  const [visible, setVisible] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const [maxPriceInfo, setMaxPriceInfo] = useState(defaultPriceInfo);
  const [minPriceInfo, setMinPriceInfo] = useState(defaultPriceInfo);
  const computedData = useMemo(
    () =>
      _.throttle((_visible) => {
        if (_visible) {
          const $products = $(
            '#product-list-v2 .product-list-new section.product-card'
          )
            .toArray()
            .flatMap((item) => {
              try {
                // 商品名称
                const title = $(item).find('.goods-title-link').text();

                // 商品图片URL
                const src = $(item)
                  .find('.crop-image-container__img')
                  .attr('src');

                if (!src || src.search('bg-grey-solid-color') !== -1) {
                  return [];
                }

                // 尝试获取.flash-price的价格
                const flashPriceString = $(item)
                  .find('.normal-price-ctn__flash-price span')
                  .text();
                const flashNumericPrice = parseFloat(
                  flashPriceString.replace('$', '')
                );

                // 尝试获取.sale-price的价格
                const salePriceString = $(item)
                  .find('.normal-price-ctn__sale-price span')
                  .text();
                const saleNumericPrice = parseFloat(
                  salePriceString.replace('$', '')
                );

                // 判断哪种价格存在并选择
                const price = isNaN(flashNumericPrice)
                  ? saleNumericPrice
                  : flashNumericPrice;

                return {
                  price,
                  title,
                  src: `https:${src}`,
                };
              } catch (e) {
                console.log('jQuery 解析错误', item);
              }

              return [
                {
                  price: 0,
                  title: '',
                  src: '',
                },
              ];
            });
          const sortedArr = _.orderBy($products, ['price'], ['desc']);
          const _maxPriceInfo = _.head(sortedArr) || defaultPriceInfo;
          const _minPriceInfo = _.last(sortedArr) || defaultPriceInfo;

          setMaxPriceInfo(_maxPriceInfo);
          setMinPriceInfo(_minPriceInfo);
          setProductsCount($products.length);
        }
      }, 500),
    []
  );

  useEffect(() => {
    window.openHLInfo = () => setVisible(true);
    window.closeHLInfo = () => setVisible(false);
    window.toggleHLInfo = () => setVisible((prev) => !prev);
    function handleScroll() {
      computedData(true);
    }
    window.addEventListener('scroll', handleScroll, false);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    computedData(visible);
  }, [visible]);

  return visible ? (
    <Box
      className="App"
      zIndex={10000}
      position={'fixed'}
      left={0}
      top={0}
      h={'100vh'}
      w={'100vw'}
      bg={'rgba(0,0,0,.2)'}
      onClick={handleModalClicked}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        overflowY={'auto'}
        position={'absolute'}
        top={0}
        right={0}
        bottom={0}
        w={'500px'}
        bg={'#ffffff'}
        p={'30px'}
      >
        <Title>概述</Title>
        <Flex justifyContent={'space-between'} mb={'40px'}>
          <Field label={'本页商品总数量'} value={productsCount} />
          <Field
            label={'本页商品中最高价格'}
            value={`$${maxPriceInfo.price}`}
          />
          <Field
            label={'本业商品中最低价格'}
            value={`$${minPriceInfo.price}`}
          />
        </Flex>
        <Title>详情</Title>
        <ProductInfo
          label={'本页产品中价格最高的产品'}
          title={maxPriceInfo.title}
          price={maxPriceInfo.price}
          src={maxPriceInfo.src}
          mb={'30px'}
        />
        <ProductInfo
          label={'本页产品中价格最低的产品'}
          title={minPriceInfo.title}
          price={minPriceInfo.price}
          src={minPriceInfo.src}
        />
      </Box>
    </Box>
  ) : null;
}

function Field(props) {
  const { label = '-', value = '-' } = props;
  return (
    <Stack>
      <Text mb={'0px'} color={'#CECECE'} fontSize={'12px'}>
        {label}
      </Text>
      <Text my={'0px'} fontSize={'16px'} fontWeight={'bold'}>
        {value}
      </Text>
    </Stack>
  );
}

function Title(props) {
  return (
    <Text mb={'20px'} fontSize={'26px'} fontWeight={'bold'}>
      {props.children}
    </Text>
  );
}

function ProductInfo(props) {
  const { label, title = '-', price = '-', src, ...rest } = props;
  return (
    <Box {...rest}>
      <Text mb={'10px'}>{label}</Text>
      <Flex border={'1px solid #232323'}>
        <AspectRatio w={'170px'} ratio={0.6} m={'10px'}>
          <Flex alignItems={'center'} w={'170px'} h={'150%'}>
            <Image src={src} w={'100%'} fit={'cover'} />
          </Flex>
        </AspectRatio>
        <Box px={'20px'}>
          <Text fontSize={'20px'} fontWeight={'bold'} my={'20px'}>
            {title}
          </Text>
          <HStack>
            <Text>Price(USD)</Text>
            <Text>${price}</Text>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
}

function handleModalClicked() {
  if (typeof window.closeHLInfo === 'function') {
    window.closeHLInfo();
  }
}
export default App;
