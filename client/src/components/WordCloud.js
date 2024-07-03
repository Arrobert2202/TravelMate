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
      rotationSteps: 2,
      drawOutOfBound: false,  
      shrinkToFit: true
    });
  }
  }, [wordMap]);

  return(
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}/>
  );
};

export default WordCloudComponent;