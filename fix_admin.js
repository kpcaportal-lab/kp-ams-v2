const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/admin/page.tsx', 'utf8');
content = content.replace('          </div>\r\n        </div>\r\n      )}', '          </div>\r\n        </motion.div>\r\n      )}');
content = content.replace('          </div>\n        </div>\n      )}', '          </div>\n        </motion.div>\n      )}');
fs.writeFileSync('src/app/(dashboard)/admin/page.tsx', content);
