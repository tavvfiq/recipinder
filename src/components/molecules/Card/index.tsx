import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { Colors, Mixins, Typography } from '@styles/index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FoodType } from '@interface/index';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Stamp from '@components/atoms/Stamp';

interface Props {
  content: FoodType;
  top: number;
  maxStack: number;
  onNoped?: (key: string) => void;
  onLiked?: (key: string) => void;
  onPress?: () => void;
}

export const CARD_HEIGHT = Mixins.heightPercentageToDP('68%');
export const CARD_WIDTH = Mixins.widthPercentageToDP('90%');

const styles = StyleSheet.create({
  outerContainer: { position: 'absolute' },
  container: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    borderRadius: 10,
  },
  thumbnail: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    height: '85%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    ...Mixins.padding(5, 10, 5, 10),
  },
  titleText: {
    fontFamily: Typography.FONT_FAMILY_MEDIUM,
    fontSize: Typography.FONT_SIZE_20,
    color: Colors.TEXT_COLOR_PRIMARY,
  },
  additionalText: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Typography.FONT_SIZE_14,
    marginLeft: Mixins.scaleSize(10),
    color: Colors.TEXT_COLOR_SECONDARY,
  },
  additionalBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 5,
    ...Mixins.padding(5, 5, 5, 5),
  },
  additionalContainer: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  stampNope: {
    position: 'absolute',
    top: 50,
    right: 20,
    transform: [{ rotateZ: '30deg' }],
  },
  stampLike: {
    position: 'absolute',
    top: 50,
    left: 20,
    transform: [{ rotateZ: '-30deg' }],
  },
});

const Card = ({ content, top, maxStack, onLiked, onNoped }: Props) => {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacityLike = useSharedValue(0);
  const opacityNope = useSharedValue(0);
  useEffect(() => {
    if (content.dismissed) {
      if (content.dismissed > 0) {
        opacityLike.value = withTiming(1);
        rotation.value = withTiming((CARD_WIDTH / 2) * 0.2);
        translateX.value = withTiming(2 * CARD_WIDTH, {}, () => {
          onLiked && runOnJS(onLiked)(content.key);
        });
        translateY.value = withTiming((CARD_WIDTH / 2) * 0.5);
      } else if (content.dismissed < 0) {
        opacityNope.value = withTiming(1);
        rotation.value = withTiming((-CARD_WIDTH / 2) * 0.2);
        translateX.value = withTiming(-2 * CARD_WIDTH, {}, () => {
          onNoped && runOnJS(onNoped)(content.key);
        });
        translateY.value = withTiming((CARD_WIDTH / 2) * 0.5);
      }
    }
  }, [content.dismissed]);
  const gestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationX }) => {
      opacityLike.value = interpolate(
        translationX,
        [0, CARD_WIDTH / 2],
        [0, 1],
        Animated.Extrapolate.CLAMP,
      );
      opacityNope.value = -interpolate(
        translationX,
        [0, -CARD_WIDTH / 2],
        [0, -1],
        Animated.Extrapolate.CLAMP,
      );
      rotation.value = translationX * 0.2;
      translateX.value = translationX;
      translateY.value = Math.abs(translationX) * 0.5;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > CARD_WIDTH / 2) {
        if (translateX.value > 0) {
          translateX.value = withTiming(2 * CARD_WIDTH, {}, () => {
            onLiked && runOnJS(onLiked)(content.key);
          });
        } else {
          translateX.value = withTiming(-2 * CARD_WIDTH, {}, () => {
            onNoped && runOnJS(onNoped)(content.key);
          });
        }
      } else {
        opacityLike.value = withTiming(0);
        opacityNope.value = withTiming(0);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        rotation.value = withTiming(0);
      }
    },
  });
  const tapEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onEnd: () => {
      console.log('tapped');
    },
  });
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withTiming(1 - (maxStack - top) * 0.01);
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotateZ: `${rotation.value}deg` },
        { scale },
      ],
    };
  });
  const animateStampLike = useAnimatedStyle(() => {
    return {
      opacity: opacityLike.value,
    };
  });
  const animateStampNope = useAnimatedStyle(() => {
    return {
      opacity: opacityNope.value,
    };
  });
  const topPosition = Math.abs(maxStack - top) * 8;
  const zIndex = top + 1;
  return (
    <TapGestureHandler onGestureEvent={tapEvent}>
      <Animated.View style={styles.outerContainer}>
        <PanGestureHandler onGestureEvent={gestureEvent}>
          <Animated.View
            style={[
              styles.container,
              animatedStyle,
              { top: topPosition, zIndex },
            ]}>
            <Image source={{ uri: content.thumb }} style={styles.thumbnail} />
            <View style={styles.textContainer}>
              <Text numberOfLines={2} style={styles.titleText}>
                {content.title}
              </Text>
              <View style={styles.additionalContainer}>
                <View style={styles.additionalBox}>
                  <Icon
                    name="clock-check-outline"
                    size={16}
                    color={Colors.GRAY_MEDIUM}
                  />
                  <Text style={styles.additionalText}>{content.times}</Text>
                </View>
                <View style={styles.additionalBox}>
                  <Icon name="food" size={16} color={Colors.GRAY_MEDIUM} />
                  <Text style={styles.additionalText}>{content.portion}</Text>
                </View>
                <View style={styles.additionalBox}>
                  <Icon name="hand-okay" size={16} color={Colors.GRAY_MEDIUM} />
                  <Text style={styles.additionalText}>{content.dificulty}</Text>
                </View>
              </View>
            </View>
            <Animated.View style={[styles.stampLike, animateStampLike]}>
              <Stamp label="LIKE" color={Colors.SUCCESS} />
            </Animated.View>
            <Animated.View style={[styles.stampNope, animateStampNope]}>
              <Stamp label="NOPE" color={Colors.DOABLE} />
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </TapGestureHandler>
  );
};

export default Card;