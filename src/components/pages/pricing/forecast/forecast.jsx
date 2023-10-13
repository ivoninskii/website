'use client';

import useScrollPosition from '@react-hook/window-scroll';
import { Alignment, Fit, Layout, useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import Container from 'components/shared/container/container';
import Link from 'components/shared/link';
import LINKS from 'constants/links';
import { activities, performance, storage } from 'constants/pricing';
import useWindowSize from 'hooks/use-window-size';
import ArrowIcon from 'icons/arrow-sm.inline.svg';

import Metrics from './metrics';

const SECTION_MIN_HEIGHT = 760;

const getSelectedIndex = (activeTitle, items) =>
  items.findIndex(({ title }) => title === activeTitle) + 1;

const Forecast = () => {
  const sectionRef = useRef();
  const { width: windowWidth, height: pageHeight } = useWindowSize();
  const scrollY = useScrollPosition();
  const [contentRef, isContentInView] = useInView({ triggerOnce: true });

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const [activeItems, setActiveItems] = useState({
    activity: activities[0],
    performance: performance[0],
    storage: storage[0],
  });

  const { RiveComponent, rive } = useRive({
    src: '/animations/pages/pricing/lights.riv',
    autoplay: false,
    stateMachines: 'SM',
    layout: new Layout({
      fit: Fit.FitWidth,
      alignment: Alignment.Center,
    }),
  });

  const animationStageInput = useStateMachineInput(rive, 'SM', 'stages', 1);
  const firstSelectInput = useStateMachineInput(rive, 'SM', '1 select', 1);
  const secondSelectInput = useStateMachineInput(rive, 'SM', '2 select', 1);
  const thirdSelectInput = useStateMachineInput(rive, 'SM', '3 select', 1);

  useEffect(() => {
    if (rive && isContentInView) {
      rive.play();
    }
  }, [rive, isContentInView, currentSectionIndex]);

  useEffect(() => {
    if (!animationStageInput) return;

    if (currentSectionIndex === 3 && animationStageInput.value === 1) {
      animationStageInput.value = 3;
    } else {
      animationStageInput.value = currentSectionIndex + 1;
    }

    if (!firstSelectInput) return;
    firstSelectInput.value = getSelectedIndex(activeItems.activity.title, activities);

    if (!secondSelectInput) return;
    secondSelectInput.value = getSelectedIndex(activeItems.performance.title, performance);

    if (!thirdSelectInput) return;
    thirdSelectInput.value = getSelectedIndex(activeItems.storage.title, storage);
  }, [
    currentSectionIndex,
    animationStageInput,
    firstSelectInput,
    secondSelectInput,
    thirdSelectInput,
    activeItems.activity.title,
    activeItems.performance.title,
    activeItems.storage.title,
  ]);

  useEffect(() => {
    const currentScrollTop = scrollY;
    const switchPointMultiplier = pageHeight < 975 ? SECTION_MIN_HEIGHT * 1 : pageHeight * 0.9;
    const switchPoints = [...Array(5)].map(
      (_, index) => sectionRef.current.offsetTop + 130 + index * switchPointMultiplier - 200
    );

    switchPoints.forEach((_, index) => {
      if (currentScrollTop > switchPoints[index] && currentScrollTop < switchPoints[index + 1]) {
        setCurrentSectionIndex(index);
      }
    });
  }, [pageHeight, scrollY]);

  return (
    <section
      className="forecast safe-paddings pt-[200px] 2xl:pt-36 md:pt-24 md:pb-20"
      ref={sectionRef}
    >
      <Container
        className="relative z-10 grid grid-cols-12 gap-x-10 xl:gap-x-6 lg:gap-x-4 md:grid-cols-1"
        size="medium"
      >
        <div className="col-start-2 col-span-5 -mr-10 xl:col-start-1 xl:col-span-6 xl:mr-0 md:col-span-full">
          <h2 className="text-6xl leading-none font-medium tracking-tighter xl:text-[56px] lg:text-5xl md:text-4xl">
            Forecasting is easy
          </h2>
          <p className="text-lg leading-snug font-light mt-4 max-w-[464px] md:text-base md:max-w-none">
            Follow a simple survey to quickly estimate potential monthly bill based on your app
            users’ activity.
          </p>
        </div>
        <div className="col-end-12 col-span-4 -ml-10 md:col-span-full md:ml-0">
          <div>
            <p className="text-lg leading-snug font-light mt-4 max-w-[255px] md:text-base md:max-w-none">
              Need an additional help or custom volume-based plans?
            </p>
            <Link
              className="mt-3.5 py-[7px] px-3 text-[15px] border border-green-45 rounded-[50px] inline-flex items-baseline leading-none text-green-45 tracking-extra-tight"
              to={LINKS.contactSales}
            >
              Contact Sales
              <ArrowIcon className="ml-1" />
            </Link>
          </div>
        </div>
      </Container>
      <Container
        className="grid grid-cols-12 gap-x-10 xl:gap-x-6 lg:gap-x-4 md:grid-cols-1"
        size="medium"
      >
        <div className="relative col-span-5 -mx-[140px] col-start-2 h-full xl:col-span-6 xl:col-start-1 xl:-mx-24 md:col-span-full md:hidden">
          <div className="sticky -top-[5vh] h-screen min-h-[900px] -mt-40">
            <div className="absolute flex h-full w-full items-center justify-center">
              <RiveComponent width={870} height={767} aria-hidden />
            </div>
          </div>
        </div>
        <div
          className="relative col-end-12 col-span-4 -ml-10 z-10 xl:col-end-13 xl:col-span-5 md:col-span-full md:ml-0"
          ref={contentRef}
        >
          <Metrics
            windowWidth={windowWidth}
            currentSectionIndex={currentSectionIndex}
            activeItems={activeItems}
            setActiveItems={setActiveItems}
          />
        </div>
      </Container>
    </section>
  );
};

export default Forecast;
