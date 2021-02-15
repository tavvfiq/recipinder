import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Layout from '@components/atoms/Layout';
import { Colors, Mixins, Typography } from '@styles/index';
import Card, { CARD_HEIGHT } from '@components/molecules/Card';
import Header from '@components/atoms/Header';
import { RootState } from '@store/index';
import { useDispatch, useSelector } from 'react-redux';
import { dismissFood, fetchFood } from '@store/food/actions';
import RoundedButton from '@components/atoms/RoundedButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderIcon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    height: CARD_HEIGHT,
    zIndex: 5,
    ...Mixins.margin(10, 0, 0, 0),
  },
  overlay: {
    position: 'absolute',
    zIndex: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: Mixins.scaleSize(150),
    height: Mixins.scaleSize(40),
  },
  errorMessage: {
    textAlign: 'center',
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.TEXT_COLOR_PRIMARY,
  },
  refreshButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Mixins.margin(30, 0, 0, 0),
  },
  likeOrNopeButton: {
    backgroundColor: Colors.WHITE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOrNopeContainer: {
    backgroundColor: Colors.GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'auto',
  },
  activityIndicator: {
    position: 'absolute',
    zIndex: 6,
  },
});

const MAX_STACK = 3;

const Home = () => {
  const { foodTinder, error, loading } = useSelector(
    (state: RootState) => state.food,
  );
  const page = useRef(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (foodTinder.length <= 5 && !loading) {
      page.current++;
      dispatch(fetchFood(page.current));
    }
  }, [foodTinder.length]);

  const onLikedWithButton = () => {
    const key = foodTinder[foodTinder.length - 1].key;
    dispatch(dismissFood(key, undefined, 1));
  };

  const onNopedWithButton = () => {
    const key = foodTinder[foodTinder.length - 1].key;
    dispatch(dismissFood(key, undefined, -1));
  };

  const onLiked = (key: string) => {
    dispatch(dismissFood(key, true));
  };
  const onNoped = (key: string) => {
    dispatch(dismissFood(key, false));
  };

  const onRefresh = () => {
    dispatch(fetchFood(page.current));
  };

  const isConnectionError = error && !loading && foodTinder.length === 0;
  const isFetching = foodTinder.length === 0 && loading;
  const isRetrying = error && loading;
  const isNotEmpty = foodTinder.length !== 0;
  return (
    <Layout>
      <Header
        isHome
        title="foodinder"
        leftIcon={
          <HeaderIcon name="cog-outline" size={30} color={Colors.SECONDARY} />
        }
        rightIcon={
          <HeaderIcon name="list-outline" size={30} color={Colors.SECONDARY} />
        }
      />
      <View style={styles.container}>
        {(isFetching || isRetrying) && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={Colors.GRAY_MEDIUM}
          />
        )}
        {isConnectionError && (
          <View style={styles.overlay}>
            <Text style={styles.errorMessage}>Server error</Text>
            <RoundedButton
              onPress={onRefresh}
              radius={32}
              containerStyle={styles.refreshButton}>
              <Icon name="refresh" size={32} color={Colors.SECONDARY} />
            </RoundedButton>
          </View>
        )}
        {isNotEmpty &&
          foodTinder.map((food, index) => {
            return (
              <Card
                maxStack={MAX_STACK}
                top={Math.min(index, MAX_STACK)}
                key={food.key}
                content={food}
                onLiked={onLiked}
                onNoped={onNoped}
              />
            );
          })}
      </View>
      <View style={styles.buttonContainer}>
        <RoundedButton
          disabled={error}
          onPress={onNopedWithButton}
          style={styles.likeOrNopeButton}
          containerStyle={styles.likeOrNopeContainer}
          radius={Mixins.heightPercentageToDP('7%')}>
          <Icon name="close-thick" size={24} color={Colors.DOABLE} />
        </RoundedButton>
        <RoundedButton
          style={styles.likeOrNopeButton}
          containerStyle={styles.likeOrNopeContainer}
          radius={Mixins.heightPercentageToDP('10%')}>
          <Icon name="book-open-variant" size={40} color={Colors.WARNING} />
        </RoundedButton>
        <RoundedButton
          disabled={error}
          onPress={onLikedWithButton}
          style={styles.likeOrNopeButton}
          containerStyle={styles.likeOrNopeContainer}
          radius={Mixins.heightPercentageToDP('7%')}>
          <Icon name="heart" size={24} color={Colors.SUCCESS} />
        </RoundedButton>
      </View>
    </Layout>
  );
};

export default Home;
