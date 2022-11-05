class Validator():
    def __init__(self, value: [int, float]):
        self._value = value
        self._validated = True
        self._error = ""
        self._validator = ""

    def maximum(self, maxlimit=[int, float], message: str = ""):
        if not self._validated:
            return self
        err = f"Value should be less than {maxlimit}." if message == "" else message
        if (self._value < maxlimit):
            return self
        self._validated = False
        self._error = err
        self._validator = 'maximum'
        return self

    def minimum(self, minlimit=[int, float], message: str = ""):
        if not self._validated:
            return self
        err = f"Value should be greater than {minlimit}." if message == "" else message
        if (self._value > minlimit):
            return self
        self._validated = False
        self._error = err
        self._validator = 'minimum'
        return self

    def multiple(self, multiplier=int, message: str = ""):
        if not self._validated:
            return self
        err = f"Value is not a multiple of {multiplier}." if message == "" else message
        if (self._value % multiplier == 0):
            return self
        self._validated = False
        self._error = err
        self._validator = 'multiple'
        return self

    def validate(self):
        if self._validated:
            return True
        else:
            return {
                'message': self._error,
                'validation': self._validator
            }