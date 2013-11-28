#pragma strict
var wheelFL : WheelCollider;
var wheelFR : WheelCollider;
var wheelRL : WheelCollider;
var wheelRR : WheelCollider;
var wheelFLTrans : Transform;
var wheelFRTrans : Transform;
var wheelRLTrans : Transform;
var wheelRRTrans : Transform;
var lowestSteerAtSpeed : float = 50;
var lowSpeedSteerAngel : float = 10;
var highSpeedSteerAngel : float = 1;
var decellarationSpeed : float = 30;
var maxTorque : float  = 50;
var currentSpeed : float = 0;
var topSpeed : float = 150;
var maxReverse : float = 50;
private var braked : boolean = false;
var maxBrakeTorque : float = 100;
private var mySidewayFriction : float;
private var myForwardFriction : float;
private var slipSidewayFriction : float;
private var slipForwardFriction : float;
//var AntiRoll = 5000.0;

function Start () {

rigidbody.centerOfMass += Vector3(0, -1, 0);
///rigidbody.centerOfMass.y = -2;
//rigidbody.centerOfMass.x = -0.1;
}
//Sets stiffness values to a low value when handbrake is applied to mimic skid
function SetValues () {
myForwardFriction = wheelRR.forwardFriction.stiffness;
mySidewayFriction = wheelRR.sidewaysFriction.stiffness;
slipForwardFriction = 0.01;
slipSidewayFriction = 0.01;
}
function FixedUpdate () {


//calculates the speed the car is going by taking the radius of the wheel and adding the formula for calculating speed - 2*pi*radius*rotations per minute. This is then multiplied again to calculate km per hr
currentSpeed = 2*22/7*wheelRL.radius*wheelRL.rpm*60/1000;
currentSpeed = Mathf.Round(currentSpeed);
//this limits the top speed of the car to the variable defined as top speed
//Negative value because we are going backwards in reverse
if (currentSpeed < topSpeed && currentSpeed > -maxReverse) {
wheelRR.motorTorque = maxTorque * Input.GetAxis("Vertical");
wheelRL.motorTorque = maxTorque * Input.GetAxis("Vertical");
}
//if the car is at top speed, no more torque is to be applied to the motors
else {
wheelRR.motorTorque = 0;
wheelRL.motorTorque = 0;
}
//applies brakes or motor force to collider to slow the car gradually
if (Input.GetButton("Vertical")==false) {
wheelRR.brakeTorque = decellarationSpeed;
wheelRL.brakeTorque = decellarationSpeed;
}
else {
wheelRR.brakeTorque = 0;
wheelRL.brakeTorque = 0;
}
//reduces steer angle at speed
var speedFactor = rigidbody.velocity.magnitude/lowestSteerAtSpeed;
var currentSteerAngel = Mathf.Lerp(lowSpeedSteerAngel,highSpeedSteerAngel,speedFactor);
currentSteerAngel *= Input.GetAxis("Horizontal");
wheelFL.steerAngle = currentSteerAngel;
wheelFR.steerAngle = currentSteerAngel;
wheelFL.steerAngle = 10 * Input.GetAxis("Horizontal");
wheelFR.steerAngle = 10 * Input.GetAxis("Horizontal");
}
//Suspension modelling, uses raycast to cast ray and detect what is being hit- eg terrain the car is going over and then moves wheels according to suspension distance settings
function WheelPosition () {
var hit : RaycastHit;
var wheelPos : Vector3;
//FL
//Casts a ray from the position of the transfrom of the wheel collider- eg the center- we are casting the ray downwards hence the minus, if the ground is hit, then compile the code and adjust the wheel to a new position mimicing suspension
if (Physics.Raycast(wheelFL.transform.position, -wheelFL.transform.up,hit,wheelFL.radius+wheelFL.suspensionDistance) ){
//get point where raycast is hit, then minus the radius of the wheel, taking the wheel up and over the hitpoint
wheelPos = hit.point+wheelFL.transform.up * wheelFL.radius;
}
else {
wheelPos = wheelFL.transform.position -wheelFL.transform.up* wheelFL.suspensionDistance; 
}
wheelFLTrans.position = wheelPos;
//FR
if (Physics.Raycast(wheelFR.transform.position, -wheelFR.transform.up,hit,wheelFR.radius+wheelFR.suspensionDistance) ){
wheelPos = hit.point+wheelFR.transform.up * wheelFR.radius;
}
else {
wheelPos = wheelFR.transform.position -wheelFR.transform.up* wheelFR.suspensionDistance; 
}
wheelFRTrans.position = wheelPos;
//RL
if (Physics.Raycast(wheelRL.transform.position, -wheelRL.transform.up,hit,wheelRL.radius+wheelRL.suspensionDistance) ){
wheelPos = hit.point+wheelRL.transform.up * wheelRL.radius;
}
else {
wheelPos = wheelRL.transform.position -wheelRL.transform.up* wheelRL.suspensionDistance; 
}
wheelRLTrans.position = wheelPos;
//RR
if (Physics.Raycast(wheelRR.transform.position, -wheelRR.transform.up,hit,wheelRR.radius+wheelRR.suspensionDistance) ){
wheelPos = hit.point+wheelRR.transform.up * wheelRR.radius;
}
else {
wheelPos = wheelRR.transform.position -wheelRR.transform.up* wheelRR.suspensionDistance; 
}
wheelRRTrans.position = wheelPos;
}
//braking
function Brakes(){
//if spacebar is pressed, boolean braked is set to true
if (Input.GetButton("Jump")){
braked = true;
}
//if not it is set to false
else{
braked = false;
}
//if spacebar is hit
if (braked){
//check the current speed is bigger than 1km an hour
if (currentSpeed > 1){
//set the brakes to full- aka value of maxBrakeTorque
wheelFR.brakeTorque = maxBrakeTorque;
wheelFL.brakeTorque = maxBrakeTorque;
//set motorTorque to 0
wheelRR.motorTorque =0;
wheelRL.motorTorque =0;
//Car slides instead of stopping dead
SetRearSlip(slipForwardFriction ,slipSidewayFriction); 
}
//if speed is smaller than zero
else if (currentSpeed < 0){
//apply brakes
wheelRR.brakeTorque = maxBrakeTorque;
wheelRL.brakeTorque = maxBrakeTorque;
wheelRR.motorTorque =0;
wheelRL.motorTorque =0;
//no slip
SetRearSlip(1 ,1); 
}

else {
SetRearSlip(1 ,1); 
}
}
}

function SetRearSlip (currentForwardFriction : float,currentSidewayFriction : float){

wheelRR.forwardFriction.stiffness = currentForwardFriction;

wheelRL.forwardFriction.stiffness = currentForwardFriction;

wheelRR.sidewaysFriction.stiffness = currentSidewayFriction;

wheelRL.sidewaysFriction.stiffness = currentSidewayFriction;

}

function SetFrontSlip (currentForwardFriction : float,currentSidewayFriction : float){

wheelFR.forwardFriction.stiffness = currentForwardFriction;

wheelFL.forwardFriction.stiffness = currentForwardFriction;

wheelFR.sidewaysFriction.stiffness = currentSidewayFriction;

wheelFL.sidewaysFriction.stiffness = currentSidewayFriction;

}



function Update (){
//spins the wheels around
// already used rotation on the transform caused 
wheelFLTrans.Rotate(wheelFL.rpm/60*360*Time.deltaTime,0,0);
wheelFRTrans.Rotate(wheelFR.rpm/60*360*Time.deltaTime,0,0);
wheelRLTrans.Rotate(wheelRL.rpm/60*360*Time.deltaTime,0,0);
wheelRRTrans.Rotate(wheelRR.rpm/60*360*Time.deltaTime,0,0);
//this part to become glitchy- so added the - wheelfltrans.localEulerAngles.z as this was the axis causing the flip
wheelFLTrans.localEulerAngles.y = wheelFL.steerAngle - wheelFLTrans.localEulerAngles.z;
wheelFRTrans.localEulerAngles.y = wheelFR.steerAngle - wheelFRTrans.localEulerAngles.z;

}