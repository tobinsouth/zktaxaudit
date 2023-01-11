pragma circom 2.1.0;


include "circomlib/comparators.circom";
include "circomlib/gates.circom";

template InRange(n) {
    //lower, upper in decimal
    signal input left;
    signal input right;
    //val in decimal
    signal input in;
    signal output out;


    component lessUpperBound = LessEqThan(n);
    component greaterLowerBound = GreaterEqThan(n);

    lessUpperBound.in[0] <== in;
    greaterLowerBound.in[0] <== in;

    
    lessUpperBound.in[1] <== right;
    greaterLowerBound.in[1] <== left;

    out <== lessUpperBound.out * greaterLowerBound.out;
}