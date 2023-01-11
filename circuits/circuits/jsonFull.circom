pragma circom 2.0.8;

include "circomlib/comparators.circom";
include "./json.circom";
include "./inRange.circom";

template getCharType() {
  signal input in; // ascii value
  signal output out[9]; // 

  component equals[6];
  for (var i = 0; i < 6; i ++) {
    equals[i] = IsEqual();
    if (i == 0) {
      equals[i].in[0] <== 125;
    }
    else if (i ==1) {
      equals[i].in[0] <== 123;
    }
    else if (i == 2) {
      equals[i].in[0] <== 44;
    }
    else if (i == 3) {
      equals[i].in[0] <== 91;
    }
    else if (i == 4) {
      equals[i].in[0] <== 93;
    }
    else if (i == 5) {
      equals[i].in[0] <== 58;
    }
    equals[i].in[1] <== in;
    out[i] <== equals[i].out;
  }

  component inRange[3];
  for (var i = 0; i < 3; i++) {
    inRange[i] = InRange(8);
    inRange[i].in <== in;
  }
  inRange[0].left <== 48;
  inRange[0].right <== 57;

  inRange[1].left <== 97;
  inRange[1].right <== 122;

  inRange[2].left <== 65;
  inRange[2].right <== 90;

  out[6] <== inRange[0].out;
  out[7] <== inRange[1].out + inRange[2].out;

  component equalsQuote = IsEqual();
  equalsQuote.in[0] <== in;
  equalsQuote.in[1] <== 34;

  out[8] <== equalsQuote.out;
}

// @jsonProgramSize = large constant for max size json
template JsonFull(jsonProgramSize, stackDepth, numKeys, numAttriExtracting, attrExtractingIndices, attriTypes) {
    // string of all the json
    signal input jsonProgram[jsonProgramSize];
    signal input values[numAttriExtracting][10];
    signal input keysOffset[numKeys][2];
    signal input valuesOffset[numKeys][2];
    signal output out;

    // + 1 to allocate empty memory field
    signal jsonStack[jsonProgramSize + 1][stackDepth];

    signal states[jsonProgramSize+1][8];

    states[0][0] <== 1;
    for (var i = 1; i < 8; i ++) {
      states[0][i] <== 0;
    }
    
    // 
    component gt[jsonProgramSize][stackDepth];
    component eq[jsonProgramSize][stackDepth];

    component boundaries[jsonProgramSize][2];

    component charTypes[jsonProgramSize];

    jsonStack[0][0] <== 1;
    for (var j = 1; j < stackDepth; j++) {
      jsonStack[0][j] <== 0;
    }

    // jsonProgram[0] === 123;
    // jsonProgram[jsonProgramSize-1] === 125;

    signal intermediates[jsonProgramSize][10];
    signal more_intermediates[jsonProgramSize][stackDepth][2];


    // TODO maybe some offset validation
    for (var i = 0; i < jsonProgramSize; i++) {
      charTypes[i] = getCharType();

      charTypes[i].in <== jsonProgram[i];
      // charTypes[i].out is 1-hot encoding of type of character
      // states are } { , [ ] : 0-9 a-Z "

      // find new state
      // log(i);
      states[i+1][0] <== 0;

      // intermediates[i][0] <== states[i][0] * charTypes[i].out[1];
      intermediates[i][1] <== states[i][0] * charTypes[i].out[1];
      intermediates[i][2] <== intermediates[i][1] + states[i][7] * charTypes[i].out[2];
      intermediates[i][3] <== intermediates[i][2] + states[i][3] * charTypes[i].out[1];
      states[i+1][1] <==  intermediates[i][3] + states[i][4] * charTypes[i].out[2];

      // Transition to 3
      states[i+1][2] <== states[i][5] * charTypes[i].out[8];

      // Transition to 4
      states[i+1][3] <== states[i][2] * charTypes[i].out[5];

      // Transition to 5
      intermediates[i][4] <== states[i][6] * charTypes[i].out[8];
      intermediates[i][5] <== intermediates[i][4] + states[i][4] * charTypes[i].out[0];
      intermediates[i][6] <== intermediates[i][5] + states[i][7] * charTypes[i].out[0];
      states[i+1][4] <==  intermediates[i][6] + states[i][1] * charTypes[i].out[0];

      // Transition to 6
      intermediates[i][7] <== states[i][1] * charTypes[i].out[8];
      states[i+1][5] <== intermediates[i][7] + states[i][5] * (1 - charTypes[i].out[8]);

      // Transition to 7
      intermediates[i][8] <== states[i][3] * charTypes[i].out[8];
      states[i+1][6] <== intermediates[i][8] + states[i][6] * (1 - charTypes[i].out[8]);

      // Transition to 8
      intermediates[i][9] <== states[i][3] * charTypes[i].out[6];
      states[i+1][7] <==  intermediates[i][9] + states[i][7] * charTypes[i].out[6];

      // for (var j = 0; j < stackDepth; j++) {
      //   gt[i][j] = LessThan(8);
      //   eq[i][j] = IsEqual();
      jsonStack[i+1][0] <== jsonStack[i][1] * charTypes[i].out[0];
      more_intermediates[i][stackDepth-1][0] <== jsonStack[i][stackDepth-1] * (1-charTypes[i].out[0]);
      jsonStack[i+1][stackDepth-1] <== more_intermediates[i][stackDepth-1][0] + jsonStack[i][stackDepth-2] * charTypes[i].out[1];

      boundaries[i][0] = IsEqual();
      boundaries[i][0].in[0] <== jsonStack[i][0] * charTypes[i].out[0];
      boundaries[i][0].in[1] <== 0;

      boundaries[i][0].out === 1;

      boundaries[i][1] = IsEqual();
      boundaries[i][1].in[0] <== jsonStack[i][stackDepth-1] * charTypes[i].out[1];
      boundaries[i][1].in[1] <== 0;


    // component stackPtrIsEqual = IsEqual();
    // stackPtrIsEqual.in[0] <== 0;
    // stackPtrIsEqual.in[1] <== stackPtr[jsonProgramSize];
      boundaries[i][1].out === 1;

      for (var j = 1; j < stackDepth-1; j++) {
          eq[i][j] = IsEqual();
          eq[i][j].in[0] <== 1;
          eq[i][j].in[1] <== jsonStack[i][j];

          more_intermediates[i][j][0] <== jsonStack[i][j+1] * charTypes[i].out[0]; // stack++;
          more_intermediates[i][j][1] <== more_intermediates[i][j][0] + jsonStack[i][j-1] * charTypes[i].out[1]; // stack--;
          jsonStack[i+1][j] <== more_intermediates[i][j][1] + jsonStack[i][j] * (1 - charTypes[i].out[0] - charTypes[i].out[1]);
      }
    }

    // extracting
    component valueMatchesNumbers[numAttriExtracting];
    component valueMatchesStrings[numAttriExtracting];
    component valueMatchesList[numAttriExtracting];
    for (var i = 0; i < numAttriExtracting; i++) {
        // If numbers
        if (attriTypes[attrExtractingIndices[i]] == 0) {
            valueMatchesStrings[i] = StringValueCompare(jsonProgramSize, 10);
            for (var attIndex = 0; attIndex < 10; attIndex++) {
                valueMatchesStrings[i].attribute[attIndex] <== values[attrExtractingIndices[i]][attIndex];
            }
            valueMatchesStrings[i].keyOffset <== valuesOffset[attrExtractingIndices[i]];
            valueMatchesStrings[i].JSON <== jsonProgram;
        }
          // If strings
        else if (attriTypes[attrExtractingIndices[i]] == 1) {
            valueMatchesNumbers[i] = NumberValueCompare(jsonProgramSize);
            valueMatchesNumbers[i].keyOffset <== valuesOffset[attrExtractingIndices[i]];
            valueMatchesNumbers[i].JSON <== jsonProgram;
            // if values is a number it will be the first element of the array
            valueMatchesNumbers[i].out === values[attrExtractingIndices[i]][0];
        // If lists
        // if it's attriTypes is not a 0 or 1, it's a list and the number is the number of the characters
        // in the list (note a list can never have 0 or 1 characters)
        }
    }



    out <== states[jsonProgramSize][4] * jsonStack[jsonProgramSize][0];
}

component main { public [ jsonProgram, keysOffset ] } = JsonFull(29, 4, 2, 2, [0, 1], [0, 1]);

// inKey active only for values we're extracting
// attrTypes contains type of value we're extracting at corresponding indices (doesn't
// matter elsewhere
// 1 is number
// 2 is string
// inKey is jsonProgramSize + 1
/* INPUT = {
  "jsonProgram": [123, 34, 110, 97, 109, 101, 34, 58, 34, 102, 111, 111, 98, 97, 114, 34, 44, 34, 118, 97, 108, 117, 101, 34, 58, 49, 50, 51, 125],
	"values": [[34, 102, 111, 111, 98, 97, 114, 34, 0, 0], [123, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
	"keysOffset": [[1, 6], [17, 23]],
	"valuesOffset": [[8, 15], [25, 27]]
} */
