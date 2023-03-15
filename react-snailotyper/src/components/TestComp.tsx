import { KeyboardEvent, useEffect, useState } from "react";
import "../stylesheets/css/TestComp.css";
import { WordComp } from "./WordComp";
import { NavbarTest } from "./NavbarComp";
import { InputTest } from "./TestInputComp";
import { MetricTracker } from "./MetricRenComp";
import * as ignoredModKeys from "../ignoredKeys";

import Typer from "../Typer/Typer";

let typer = new Typer();

let firstFetched = await typer.textGenerator(30);

export function Test() {
  let testObj = {};
  let testType = { type: "time", value: 15 };

  const [genText, setGenText] = useState<string[]>(firstFetched);

  const [launched, setLaunched] = useState<boolean>(false);

  const [metric, setMetric] = useState<object>(testType);
  // if you could group metric and testTracked that would be good
  const [testTracker, setTestTracker] = useState<object>(testObj);

  const [wordMetric, setWordMetric] = useState({
    wordsLength: 0,
    indexWord: 0,
  }); // object for both wordsLength & idxWord

  const [char, setChar] = useState<object>({ typedChar: "", index: 0 });

  let wordsFetched = async (num: number) => {
    let words = await typer.textGenerator(num);
    return words;
  };
  async function handleGenTextNum(e: number) {
    let numTextGen = e;
    testType = { type: "words", value: numTextGen };
    setMetric(testType);
    setGenText(await wordsFetched(numTextGen));
  }
  async function handleTimerSet(e: number) {
    let numTextGen = e;
    testType = { type: "time", value: numTextGen };
    setMetric(testType);
    if (numTextGen >= 60) {
      let i = Math.floor(numTextGen * 1.5);
      setGenText(await wordsFetched(i));
    } else {
      let i = Math.floor(numTextGen * 2);
      setGenText(await wordsFetched(i));
    }
  }

  function keyLogger(e: KeyboardEvent) {
    if (ignoredModKeys.ignoredKeys.includes(e.key)) {
      return e.key;
    } else if (e.ctrlKey && e.shiftKey && e.key) {
      return;
    } else {
      setLaunched(true);
      setChar({ typedChar: e.key, index: char.index + 1 });
    }
  }

  function setStateTestTrack(valueToSet: object) {
    setTestTracker(valueToSet);
  }
  function getIdxWord(idx: number) {
    setWordMetric({
      ...wordMetric,
      wordsLength: genText.length,
      indexWord: idx,
    });
  }

  useEffect(() => {
    function globalTypeSensor(e: KeyboardEvent) {
      testObj = typer.start(metric);
      setTestTracker(testObj);
    }
    document.addEventListener("keydown", globalTypeSensor, { once: true });
    return () => {
      document.removeEventListener("keydown", globalTypeSensor);
    };
  }, [launched]);
  /* 
  this should be fixed as well, if ignoredKeys == the typedKey, don't start the test, else start test
   */

  useEffect(() => {
    setLaunched(false);
    setTestTracker({});
    setWordMetric({ wordsLength: genText.length, indexWord: 0 });
  }, [genText]);

  return (
    <>
      <NavbarTest
        onGenText={(e) => handleGenTextNum(e)}
        onSetTimer={(e) => handleTimerSet(e)}
      />
      <MetricTracker
        isLaunched={launched}
        metric={metric}
        wordMetric={wordMetric}
      />
      <div id="test-subject-typer">
        <InputTest keyLogger={keyLogger} />
        <WordComp
          words={genText}
          typedCharObj={char}
          testObj={testTracker}
          setStateTestTrack={setStateTestTrack}
          getidxWord={getIdxWord}
        />
      </div>
    </>
  );
}

/**
 *
 * TASKS:
 *    figure out how to end the test on which Conditions
 *    find a way to calculate wpm in metric "words", => using the chrono param in testObj
 * */

/**
 * the auto scroll should be added &  <div id="caret"></div> turn this into it's own component
 */
