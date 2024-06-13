import React, { useEffect, useRef } from 'react';
import WordCloud from 'wordcloud';

function WordCloudComponent({wordMap}) {
  const canvasRef = useRef(null);

  useEffect(()=>{
    console.log("wordmap: ", wordMap);
    if(wordMap && Object.keys(wordMap).length > 0){
    const words = Object.entries(wordMap).map(([word, frequency]) => ([word, frequency]));
    console.log(words);
    WordCloud(canvasRef.current, {
      list: words,
      gridSize: 20,
      weightFactor: 20,
      fontFamily: 'Times, serif',
      rotateRatio: 0.5,
      shape: 'square',
      rotationSteps: 2
    });
  }
  }, [wordMap]);

  return(
    <canvas ref={canvasRef} width={600} height={400}/>
  );
};

export default WordCloudComponent;